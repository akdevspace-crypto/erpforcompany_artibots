import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
import { types } from 'mediasoup';
import { config } from './mediasoup.config';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createSdpText } from './sdp.utils';
import * as dgram from 'dgram';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class MediasoupService implements OnModuleInit {
    private workers: types.Worker[] = [];
    private nextWorkerIndex = 0;
    private routers: Map<string, types.Router> = new Map(); // RoomId -> Router
    private transports: Map<string, types.WebRtcTransport | types.PlainTransport> = new Map();
    private producers: Map<string, types.Producer> = new Map();
    private consumers: Map<string, types.Consumer> = new Map();
    private activeRecordings = new Map<string, any>(); // producerId -> { process, path }
    private ffmpegPath = 'ffmpeg'; // Default

    private supabase = createClient(
        process.env.SUPABASE_URL || 'https://wqqpafsisdnsgpwipyqg.supabase.co',
        process.env.SUPABASE_KEY || process.env.JWT_SECRET || 'placeholder-key',
        { auth: { persistSession: false } }
    );

    async onModuleInit() {
        this.ffmpegPath = this.findFFmpegPath();
        console.log(`[MediasoupService] Using FFmpeg path: ${this.ffmpegPath}`);
        await this.createWorkers();
        // Try creating bucket on init too
        try {
            await this.supabase.storage.createBucket('recordings', { public: true });
        } catch (e) {
            // ignore if exists
        }
    }

    private findFFmpegPath(): string {
        const fs = require('fs');
        const path = require('path');

        // 1. Check if 'ffmpeg' works (in PATH) - strict check hard, assume yes if not found else
        // 2. Search C: drive for ffmpeg folder
        if (process.platform === 'win32') {
            try {
                const cDirs = fs.readdirSync('C:\\').filter(d => d.startsWith('ffmpeg-') && fs.statSync(`C:\\${d}`).isDirectory());
                if (cDirs.length > 0) {
                    const binPath = path.join('C:\\', cDirs[0], 'bin', 'ffmpeg.exe');
                    if (fs.existsSync(binPath)) return binPath;
                }
            } catch (e) {
                console.warn('[MediasoupService] Could not search C: for ffmpeg:', e.message);
            }
        }
        return 'ffmpeg';
    }

    private async createWorkers() {
        const { numWorkers } = config.mediasoup;

        for (let i = 0; i < numWorkers; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: config.mediasoup.worker.logLevel as any,
                logTags: config.mediasoup.worker.logTags as any,
                rtcMinPort: config.mediasoup.worker.rtcMinPort,
                rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
            });

            worker.on('died', () => {
                console.error(`mediasoup worker died, exiting in 2 seconds...[pid: ${worker.pid}]`);
                setTimeout(() => process.exit(1), 2000);
            });

            this.workers.push(worker);
        }
        console.log(`Mediasoup workers created: ${this.workers.length} `);
    }

    getWorker(): types.Worker {
        const worker = this.workers[this.nextWorkerIndex];
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
        return worker;
    }

    async createRouter(roomId: string): Promise<types.Router> {
        if (this.routers.has(roomId)) {
            return this.routers.get(roomId)!;
        }

        const worker = this.getWorker();
        const router = await worker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs });
        this.routers.set(roomId, router);
        return router;
    }

    getRouter(roomId: string): types.Router | undefined {
        return this.routers.get(roomId);
    }

    addTransport(transport: types.WebRtcTransport) {
        this.transports.set(transport.id, transport);
    }

    getTransport(id: string): types.WebRtcTransport | undefined {
        return this.transports.get(id) as types.WebRtcTransport;
    }

    addProducer(producer: types.Producer) {
        this.producers.set(producer.id, producer);
    }

    getProducer(id: string): types.Producer | undefined {
        return this.producers.get(id);
    }

    addConsumer(consumer: types.Consumer) {
        this.consumers.set(consumer.id, consumer);
    }

    getConsumer(id: string): types.Consumer | undefined {
        return this.consumers.get(id);
    }

    // Helper to find free UDP port
    async getFreePort(): Promise<number> {
        return new Promise((resolve, reject) => {
            const socket = dgram.createSocket('udp4');
            socket.bind(0, () => {
                const port = socket.address().port;
                socket.close(() => resolve(port));
            });
            socket.on('error', (err) => reject(err));
        });
    }

    async startRecording(roomId: string, producerId: string): Promise<string | null> {
        const fsv = require('fs');
        const logPath = 'recording_debug_v2.log';
        const log = (msg) => {
            const line = `[MediasoupService] ${new Date().toISOString()} ${msg}\n`;
            console.log(line.trim());
            fsv.appendFileSync(logPath, line);
        };

        // Delay recording slightly to allow WebRTC consumers to stabilize first
        await new Promise(resolve => setTimeout(resolve, 1000));

        log(`startRecording for room ${roomId}, producer ${producerId}`);

        const router = this.routers.get(roomId);
        if (!router) {
            console.error('Router not found for recording');
            return null;
        }

        // 1. Create Plain Transport (Mediasoup side)
        const transport = await router.createPlainTransport({
            listenIp: { ip: '127.0.0.1', announcedIp: undefined },
            rtcpMux: false,
            comedia: false,
        });

        // 2. Consume the producer
        const consumer = await transport.consume({
            producerId,
            rtpCapabilities: router.rtpCapabilities,
            paused: false,
        });

        // 3. Get free ports for FFmpeg to listen on
        const remoteRtpPort = await this.getFreePort();
        const remoteRtcpPort = await this.getFreePort();

        // 4. Connect Mediasoup transport to FFmpeg's ports
        await transport.connect({
            ip: '127.0.0.1',
            port: remoteRtpPort,
            rtcpPort: remoteRtcpPort
        });

        // 5. Generate SDP for FFmpeg
        const sdp = createSdpText(consumer.rtpParameters, remoteRtpPort, remoteRtcpPort, '127.0.0.1');

        // 6. Prepare Files
        const timestamp = Date.now();
        const recordingDir = path.join(process.cwd(), 'uploads', 'recordings');
        if (!fs.existsSync(recordingDir)) {
            fs.mkdirSync(recordingDir, { recursive: true });
        }
        const filename = `${producerId}-${timestamp}`;
        const sdpPath = path.join(recordingDir, `${filename}.sdp`);
        const recordingPath = path.join(recordingDir, `${filename}.webm`);

        fs.writeFileSync(sdpPath, sdp);
        log(`Written SDP to ${sdpPath}`);

        // 7. Spawn FFmpeg
        const args = [
            '-protocol_whitelist', 'file,udp,rtp',
            '-i', sdpPath,
            '-map', '0:a:0',
            '-c:a', 'copy', // Copy Opus stream directly
            '-y',
            recordingPath
        ];
        log(`Spawning FFmpeg with args: ${args.join(' ')}`);

        const ffmpeg = spawn(this.ffmpegPath, args);

        ffmpeg.on('error', (err) => {
            console.error('[Recording] FFmpeg error:', err);
            log(`FFmpeg error: ${err.message}`);
        });

        // Log stderr for debugging
        ffmpeg.stderr.on('data', (data) => {
            const msg = data.toString();
            console.error(`[FFmpeg STDERR] ${msg}`);
            log(`[FFmpeg STDERR] ${msg}`);
        });

        this.activeRecordings.set(producerId, { process: ffmpeg, path: recordingPath, transport, consumer });

        return `/uploads/recordings/${filename}.webm`;
    }

    async stopRecording(producerId: string) {
        const fsv = require('fs');
        const logPath = 'recording_debug_v2.log';
        const log = (msg) => {
            const line = `[MediasoupService] ${new Date().toISOString()} ${msg}\n`;
            console.log(line.trim());
            fsv.appendFileSync(logPath, line);
        };
        log(`stopRecording for producer ${producerId}`);

        const record = this.activeRecordings.get(producerId);
        if (record) {
            console.log(`[MediasoupService] Stopping recording for ${producerId}`);

            // 1. Kill FFmpeg gracefully to close the container
            // On Windows, SIGINT might not work well. Send 'q' to stdin.
            if (record.process.stdin && record.process.stdin.writable) {
                record.process.stdin.write('q');
            } else {
                record.process.kill('SIGINT');
            }

            // Wait a moment for FFmpeg to finalize the file
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Force kill if still running (optional, but good safety)
            // if (!record.process.killed) record.process.kill();

            record.consumer.close();
            record.transport.close();
            this.activeRecordings.delete(producerId);

            // Check if file exists
            if (!fs.existsSync(record.path)) {
                log(`File missing at: ${record.path}`);
                return null;
            }

            const stats = fs.statSync(record.path);
            log(`File exists. Size: ${stats.size} bytes`);

            const fileName = path.basename(record.path);
            const relativeLocalPath = `uploads/recordings/${fileName}`; // Web-accessible relative path

            // 2. Upload to Supabase

            // 2. Upload to Supabase
            try {
                // Ensure bucket exists (best effort)
                const { error: bucketError } = await this.supabase.storage.createBucket('project-files', { public: true });
                if (bucketError && !bucketError.message.includes('already exists')) {
                    console.warn('[Supabase] Bucket creation error:', bucketError.message);
                }

                if (fs.existsSync(record.path)) {
                    const fileBuffer = fs.readFileSync(record.path);

                    const { data, error } = await this.supabase
                        .storage
                        .from('project-files')
                        .upload(`Call-Recording/${fileName}`, fileBuffer, {
                            contentType: 'audio/webm',
                            upsert: true
                        });

                    if (error) {
                        console.error('[Supabase] Upload error:', error);
                        log(`Supabase Upload Error: ${error.message}. Returning local path.`);
                        // Return local relative path as fallback
                        return relativeLocalPath;
                    }

                    // 3. Get Public URL
                    const { data: { publicUrl } } = this.supabase
                        .storage
                        .from('project-files')
                        .getPublicUrl(`Call-Recording/${fileName}`);

                    console.log(`[Supabase] Uploaded recording: ${publicUrl}`);
                    log(`Uploaded to Supabase: ${publicUrl}`);

                    return publicUrl;
                }
            } catch (err) {
                console.error('[Recording] Error processing recording file:', err);
                return relativeLocalPath;
            }

            return relativeLocalPath;
        }
        return null;
    }
}
