import { OnModuleInit } from '@nestjs/common';
import { types } from 'mediasoup';
export declare class MediasoupService implements OnModuleInit {
    private workers;
    private nextWorkerIndex;
    private routers;
    private transports;
    private producers;
    private consumers;
    private activeRecordings;
    private ffmpegPath;
    private supabase;
    onModuleInit(): Promise<void>;
    private findFFmpegPath;
    private createWorkers;
    getWorker(): types.Worker;
    createRouter(roomId: string): Promise<types.Router>;
    getRouter(roomId: string): types.Router | undefined;
    addTransport(transport: types.WebRtcTransport): void;
    getTransport(id: string): types.WebRtcTransport | undefined;
    addProducer(producer: types.Producer): void;
    getProducer(id: string): types.Producer | undefined;
    addConsumer(consumer: types.Consumer): void;
    getConsumer(id: string): types.Consumer | undefined;
    getFreePort(): Promise<number>;
    startRecording(roomId: string, producerId: string): Promise<string | null>;
    stopRecording(producerId: string): Promise<string | null>;
}
