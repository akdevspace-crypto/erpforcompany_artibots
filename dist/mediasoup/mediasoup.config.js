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
exports.config = void 0;
const os = __importStar(require("os"));
const getLocalIp = () => {
    if (process.env.MEDIASOUP_ANNOUNCED_IP) {
        return process.env.MEDIASOUP_ANNOUNCED_IP;
    }
    const interfaces = os.networkInterfaces();
    const candidates = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wifi') || name.toLowerCase().includes('wlan')) {
                    return iface.address;
                }
                if (name.toLowerCase().includes('ethernet') && !name.toLowerCase().includes('vethernet')) {
                    return iface.address;
                }
                candidates.push(iface.address);
            }
        }
    }
    if (candidates.length > 0)
        return candidates[0];
    return '127.0.0.1';
};
const localIp = getLocalIp();
console.log('[MediasoupConfig] Using Announced IP:', localIp);
const getListenIps = () => {
    const ips = [];
    if (localIp && localIp !== '127.0.0.1') {
        ips.push({
            ip: '0.0.0.0',
            announcedIp: localIp,
        });
    }
    else {
        ips.push({
            ip: '0.0.0.0',
            announcedIp: '127.0.0.1',
        });
    }
    return ips;
};
exports.config = {
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
            ],
        },
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
            ],
        },
        webRtcTransport: {
            listenIps: getListenIps(),
            initialAvailableOutgoingBitrate: 1000000,
        },
    },
};
//# sourceMappingURL=mediasoup.config.js.map