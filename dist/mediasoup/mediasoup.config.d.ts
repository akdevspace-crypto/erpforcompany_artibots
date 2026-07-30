import { types } from 'mediasoup';
export declare const config: {
    mediasoup: {
        numWorkers: number;
        worker: {
            rtcMinPort: number;
            rtcMaxPort: number;
            logLevel: string;
            logTags: types.WorkerLogTag[];
        };
        router: {
            mediaCodecs: types.RtpCodecCapability[];
        };
        webRtcTransport: {
            listenIps: any[];
            initialAvailableOutgoingBitrate: number;
        };
    };
};
