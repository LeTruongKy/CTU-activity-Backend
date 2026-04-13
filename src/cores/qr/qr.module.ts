import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QRService } from './qr.service';

@Module({
  imports: [ConfigModule],
  providers: [QRService],
  exports: [QRService],
})
export class QRModule {}
