"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediasoupService = void 0;
const common_1 = require("@nestjs/common");
const mediasoup = __importStar(require("mediasoup"));
const mediasoup_config_1 = require("./mediasoup.config");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sdp_utils_1 = require("./sdp.utils");
const dgram = __importStar(require("dgram"));
const supabase_js_1 = require("@supabase/supabase-js");
let MediasoupService = class MediasoupService {
    workers = [];
    nextWorkerIndex = 0;
    routers = new Map();
    transports = new Map();
    producers = new Map();
    consumers = new Map();
    activeRecordings = new Map();
    ffmpegPath = 'ffmpeg';
    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || 'https://wqqpafsisdnsgpwipyqg.supabase.co', process.env.SUPABASE_KEY || process.env.JWT_SECRET || 'placeholder-key', { auth: { persistSession: false } });
    async onModuleInit() {
        this.ffmpegPath = this.findFFmpegPath();
        console.log(`[MediasoupService] Using FFmpeg path: ${this.ffmpegPath}`);
        await this.createWorkers();
        try {
            await this.supabase.storage.createBucket('recordings', { public: true });
        }
        catch (e) {
        }
    }
    findFFmpegPath() {
        const fs = require('fs');
        const path = require('path');
        if (process.platform === 'win32') {
            try {
                const cDirs = fs.readdirSync('C:\\').filter(d => d.startsWith('ffmpeg-') && fs.statSync(`C:\\${d}`).isDirectory());
                if (cDirs.length > 0) {
                    const binPath = path.join('C:\\', cDirs[0], 'bin', 'ffmpeg.exe');
                    if (fs.existsSync(binPath))
                        return binPath;
                }
            }
            catch (e) {
                console.warn('[MediasoupService] Could not search C: for ffmpeg:', e.message);
            }
        }
        return 'ffmpeg';
    }
    async createWorkers() {
        const { numWorkers } = mediasoup_config_1.config.mediasoup;
        for (let i = 0; i < numWorkers; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: mediasoup_config_1.config.mediasoup.worker.logLevel,
                logTags: mediasoup_config_1.config.mediasoup.worker.logTags,
                rtcMinPort: mediasoup_config_1.config.mediasoup.worker.rtcMinPort,
                rtcMaxPort: mediasoup_config_1.config.mediasoup.worker.rtcMaxPort,
            });
            worker.on('died', () => {
                console.error(`mediasoup worker died, exiting in 2 seconds...[pid: ${worker.pid}]`);
                setTimeout(() => process.exit(1), 2000);
            });
            this.workers.push(worker);
        }
        console.log(`Mediasoup workers created: ${this.workers.length} `);
    }
    getWorker() {
        const worker = this.workers[this.nextWorkerIndex];
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
        return worker;
    }
    async createRouter(roomId) {
        if (this.routers.has(roomId)) {
            return this.routers.get(roomId);
        }
        const worker = this.getWorker();
        const router = await worker.createRouter({ mediaCodecs: mediasoup_config_1.config.mediasoup.router.mediaCodecs });
        this.routers.set(roomId, router);
        return router;
    }
    getRouter(roomId) {
        return this.routers.get(roomId);
    }
    addTransport(transport) {
        this.transports.set(transport.id, transport);
    }
    getTransport(id) {
        return this.transports.get(id);
    }
    addProducer(producer) {
        this.producers.set(producer.id, producer);
    }
    getProducer(id) {
        return this.producers.get(id);
    }
    addConsumer(consumer) {
        this.consumers.set(consumer.id, consumer);
    }
    getConsumer(id) {
        return this.consumers.get(id);
    }
    async getFreePort() {
        return new Promise((resolve, reject) => {
            const socket = dgram.createSocket('udp4');
            socket.bind(0, () => {
                const port = socket.address().port;
                socket.close(() => resolve(port));
            });
            socket.on('error', (err) => reject(err));
        });
    }
    async startRecording(roomId, producerId) {
        const fsv = require('fs');
        const logPath = 'recording_debug_v2.log';
        const log = (msg) => {
            const line = `[MediasoupService] ${new Date().toISOString()} ${msg}\n`;
            console.log(line.trim());
            fsv.appendFileSync(logPath, line);
        };
        await new Promise(resolve => setTimeout(resolve, 1000));
        log(`startRecording for room ${roomId}, producer ${producerId}`);
        const router = this.routers.get(roomId);
        if (!router) {
            console.error('Router not found for recording');
            return null;
        }
        const transport = await router.createPlainTransport({
            listenIp: { ip: '127.0.0.1', announcedIp: undefined },
            rtcpMux: false,
            comedia: false,
        });
        const consumer = await transport.consume({
            producerId,
            rtpCapabilities: router.rtpCapabilities,
            paused: false,
        });
        const remoteRtpPort = await this.getFreePort();
        const remoteRtcpPort = await this.getFreePort();
        await transport.connect({
            ip: '127.0.0.1',
            port: remoteRtpPort,
            rtcpPort: remoteRtcpPort
        });
        const sdp = (0, sdp_utils_1.createSdpText)(consumer.rtpParameters, remoteRtpPort, remoteRtcpPort, '127.0.0.1');
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
        const args = [
            '-protocol_whitelist', 'file,udp,rtp',
            '-i', sdpPath,
            '-map', '0:a:0',
            '-c:a', 'copy',
            '-y',
            recordingPath
        ];
        log(`Spawning FFmpeg with args: ${args.join(' ')}`);
        const ffmpeg = (0, child_process_1.spawn)(this.ffmpegPath, args);
        ffmpeg.on('error', (err) => {
            console.error('[Recording] FFmpeg error:', err);
            log(`FFmpeg error: ${err.message}`);
        });
        ffmpeg.stderr.on('data', (data) => {
            const msg = data.toString();
            console.error(`[FFmpeg STDERR] ${msg}`);
            log(`[FFmpeg STDERR] ${msg}`);
        });
        this.activeRecordings.set(producerId, { process: ffmpeg, path: recordingPath, transport, consumer });
        return `/uploads/recordings/${filename}.webm`;
    }
    async stopRecording(producerId) {
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
            if (record.process.stdin && record.process.stdin.writable) {
                record.process.stdin.write('q');
            }
            else {
                record.process.kill('SIGINT');
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
            record.consumer.close();
            record.transport.close();
            this.activeRecordings.delete(producerId);
            if (!fs.existsSync(record.path)) {
                log(`File missing at: ${record.path}`);
                return null;
            }
            const stats = fs.statSync(record.path);
            log(`File exists. Size: ${stats.size} bytes`);
            const fileName = path.basename(record.path);
            const relativeLocalPath = `uploads/recordings/${fileName}`;
            try {
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
                        return relativeLocalPath;
                    }
                    const { data: { publicUrl } } = this.supabase
                        .storage
                        .from('project-files')
                        .getPublicUrl(`Call-Recording/${fileName}`);
                    console.log(`[Supabase] Uploaded recording: ${publicUrl}`);
                    log(`Uploaded to Supabase: ${publicUrl}`);
                    return publicUrl;
                }
            }
            catch (err) {
                console.error('[Recording] Error processing recording file:', err);
                return relativeLocalPath;
            }
            return relativeLocalPath;
        }
        return null;
    }
};
exports.MediasoupService = MediasoupService;
exports.MediasoupService = MediasoupService = __decorate([
    (0, common_1.Injectable)()
], MediasoupService);
//# sourceMappingURL=mediasoup.service.js.map