import { Module } from '@nestjs/common';
import { MediasoupService } from './mediasoup.service';
import { MediasoupGateway } from './mediasoup.gateway';
import { CommunicationModule } from '../communication/communication.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [CommunicationModule, AuthModule],
    providers: [MediasoupService, MediasoupGateway],
    exports: [MediasoupService],
})
export class MediasoupModule { }
