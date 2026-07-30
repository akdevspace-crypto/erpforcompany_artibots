import { types } from 'mediasoup';
import * as os from 'os';

// Helper to get local IP with priority for Wi-Fi/Ethernet
const getLocalIp = () => {
    // 1. Check env var first
    if (process.env.MEDIASOUP_ANNOUNCED_IP) {
        return process.env.MEDIASOUP_ANNOUNCED_IP;
    }

    const interfaces = os.networkInterfaces();
    const candidates: string[] = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Prioritize known physical interfaces
                if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wifi') || name.toLowerCase().includes('wlan')) {
                    return iface.address;
                }
                if (name.toLowerCase().includes('ethernet') && !name.toLowerCase().includes('vethernet')) { // Exclude Hyper-V
                    return iface.address;
                }
                candidates.push(iface.address);
            }
        }
    }

    // Fallback to first found candidate if no specific preferred interface found
    if (candidates.length > 0) return candidates[0];

    return '127.0.0.1';
};

const localIp = getLocalIp();
console.log('[MediasoupConfig] Using Announced IP:', localIp);

const getListenIps = (): any[] => {
    const ips: any[] = [];
    if (localIp && localIp !== '127.0.0.1') {
        ips.push({
            ip: '0.0.0.0',
            announcedIp: localIp,
        });
    } else {
        ips.push({
            ip: '0.0.0.0',
            announcedIp: '127.0.0.1',
        });
    }
    return ips;
};

export const config = {
    // Worker settings
    mediasoup: {
        numWorkers: Object.keys(os.cpus()).length,
        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 20000,
            logLevel: 'warn',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
                'debug',
            ] as types.WorkerLogTag[], // Added debug for better visibility
        },
        // Router settings
        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000,
                    },
                },
            ] as types.RtpCodecCapability[],
        },
        // WebRtcTransport settings
        webRtcTransport: {
            listenIps: getListenIps(),
            initialAvailableOutgoingBitrate: 1000000,
        },
    },
};
