import {
  Controller,
  Post,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrationsService } from './registrations.service';
import { QRService } from '../../cores/qr/qr.service';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QRCheckInController {
  private readonly logger = new Logger(QRCheckInController.name);

  constructor(
    private registrationsService: RegistrationsService,
    private qrService: QRService,
  ) {}

  /**
   * POST /qr/:activityId/check-in
   * Check in user via QR code
   *
   * Body: { qrData: "base64-encoded-qr-payload" }
   */
  @Post(':activityId/check-in')
  async checkInViaQR(
    @Request() req,
    @Param('activityId', ParseIntPipe) activityId: number,
    @Query('data') encodedData?: string,
  ) {
    try {
      this.logger.debug(`QR check-in attempt: user=${req.user.id}, activity=${activityId}`);

      if (!encodedData) {
        throw new BadRequestException('QR data required');
      }

      // Decode QR payload
      const qrPayload = this.qrService.decodeQRPayload(encodedData);

      // Validate QR
      const validation = this.qrService.validateQRPayload(qrPayload);

      if (!validation.valid) {
        throw new BadRequestException(validation.error || 'Invalid QR code');
      }

      // Validate activity ID matches
      if (validation.activityId !== activityId) {
        throw new BadRequestException('QR activity ID mismatch');
      }

      // Perform check-in
      const result = await this.registrationsService.checkIn(
        req.user.id,
        activityId,
        encodedData,
      );

      return {
        success: true,
        message: 'Check-in successful',
        registration: result,
      };
    } catch (error) {
      this.logger.error(`Check-in error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * POST /qr/validate
   * Validate QR code (test endpoint)
   */
  @Post('validate')
  validateQR(@Query('data') encodedData: string) {
    try {
      if (!encodedData) {
        throw new BadRequestException('QR data required');
      }

      const qrPayload = this.qrService.decodeQRPayload(encodedData);
      const validation = this.qrService.validateQRPayload(qrPayload);

      return {
        valid: validation.valid,
        activityId: validation.activityId,
        expirationTime: validation.expirationTime,
        error: validation.error,
      };
    } catch (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`);
    }
  }
}
