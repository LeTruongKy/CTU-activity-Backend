import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * 🔐 QR CODE SERVICE
 *
 * Provides secure QR code generation and validation
 *
 * Features:
 * - Generate unique secrets per activity
 * - HMAC signature for tamper protection
 * - Expiration time validation
 * - Prevents replay attacks
 */
@Injectable()
export class QRService {
  private readonly logger = new Logger(QRService.name);
  private readonly QR_SECRET_KEY: string;

  constructor(private configService: ConfigService) {
    this.QR_SECRET_KEY = this.configService.get<string>('QR_SECRET_KEY') || 'default-qr-secret-key-change-in-production';
  }

  /**
   * Generate unique QR secret for activity
   */
  generateQRSecret(activityId: number): string {
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();
    const combined = `${activityId}:${randomBytes}:${timestamp}`;

    const secret = crypto
      .createHmac('sha256', this.QR_SECRET_KEY)
      .update(combined)
      .digest('hex');

    this.logger.debug(`Generated QR secret for activity=${activityId}`);
    return secret;
  }

  /**
   * 📝 Generate QR data payload
   *
   * Format: activityId:secret:expiration:signature
   * Signature is HMAC-SHA256 of the payload without signature
   */
  generateQRPayload(
    activityId: number,
    secret: string,
    expirationTime: Date,
  ): string {
    const expirationMs = expirationTime.getTime();
    const basePayload = `${activityId}:${secret}:${expirationMs}`;

    // Sign the payload
    const signature = crypto
      .createHmac('sha256', this.QR_SECRET_KEY)
      .update(basePayload)
      .digest('hex');

    const fullPayload = `${basePayload}:${signature}`;

    this.logger.debug(`Generated QR payload for activity=${activityId}, expires=${expirationTime}`);

    return fullPayload;
  }

  /**
   * 🔐 Validate QR payload
   *
   * Checks:
   * 1. Signature validity (prevents tampering)
   * 2. Expiration time (prevents replay)
   * 3. Format validation
   */
  validateQRPayload(payload: string): {
    valid: boolean;
    activityId?: number;
    secret?: string;
    expirationTime?: Date;
    error?: string;
  } {
    try {
      const parts = payload.split(':');
      if (parts.length !== 4) {
        return {
          valid: false,
          error: 'Invalid QR format',
        };
      }

      const [activityIdStr, secret, expirationMsStr, providedSignature] = parts;
      const activityId = parseInt(activityIdStr, 10);
      const expirationMs = parseInt(expirationMsStr, 10);

      // Validate expiration
      const now = Date.now();
      if (now > expirationMs) {
        return {
          valid: false,
          error: 'QR code has expired',
        };
      }

      // Verify signature
      const basePayload = `${activityIdStr}:${secret}:${expirationMsStr}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.QR_SECRET_KEY)
        .update(basePayload)
        .digest('hex');

      if (providedSignature !== expectedSignature) {
        return {
          valid: false,
          error: 'QR code signature invalid (tampered)',
        };
      }

      // All checks passed
      const expirationTime = new Date(expirationMs);

      this.logger.debug(`QR validation successful for activity=${activityId}`);

      return {
        valid: true,
        activityId,
        secret,
        expirationTime,
      };
    } catch (error) {
      this.logger.error(`QR validation error: ${error.message}`, error.stack);
      return {
        valid: false,
        error: `QR validation failed: ${error.message}`,
      };
    }
  }

  /**
   * 🎯 Generate full QR check-in URL
   *
   * URL format: https://domain.com/qr/check-in?data=...
   */
  generateQRCheckInUrl(
    baseUrl: string,
    payload: string,
  ): string {
    const encodedPayload = Buffer.from(payload).toString('base64');
    return `${baseUrl}/qr/check-in?data=${encodedPayload}`;
  }

  /**
   * 🔍 Decode QR payload from URL parameter
   */
  decodeQRPayload(encodedPayload: string): string {
    try {
      return Buffer.from(encodedPayload, 'base64').toString('utf-8');
    } catch (error) {
      throw new BadRequestException('Invalid QR payload encoding');
    }
  }

  /**
   * 📊 Calculate QR expiration time
   * Default: activity end + 1 hour grace period
   */
  calculateQRExpiration(activityEndTime: Date): Date {
    const expiration = new Date(activityEndTime);
    expiration.setHours(expiration.getHours() + 1); // +1 hour grace period
    return expiration;
  }
}
