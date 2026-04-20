import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QRService } from './qr.service';
import { QrUrlService } from './qr-url.service';

@Module({
  imports: [ConfigModule],
  providers: [QRService, QrUrlService],
  exports: [QRService, QrUrlService],
})
export class QRModule {}
