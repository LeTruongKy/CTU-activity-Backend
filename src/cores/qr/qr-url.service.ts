import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * ðŸ” QR URL SERVICE
 *
 * Generates QR URLs with cryptographic signatures for activity check-in.
 * 
 * URL Format: {FRONTEND_URL}/checkin?activityId={id}&timestamp={timestamp}&signature={signature}
 * 
 * Features:
 * - URL-based QR code generation
 * - HMAC-SHA256 signature verification
 * - Timestamp-based expiration checks (optional)
 * - No hardcoded URLs - uses FRONTEND_URL env variable
 */
@Injectable()
export class QrUrlService {
  private readonly logger = new Logger(QrUrlService.name);
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!this.frontendUrl) {
      this.logger.error('FRONTEND_URL is not defined in environment variables');
    }
  }

  /**
   * Generate random QR secret (32 bytes hex)
   * Called once when creating an activity
   */
  generateQrSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate QR URL with signature
   * 
   * @param activityId - Activity ID
   * @param qrSecret - Secret key stored in activity
   * @returns Full QR URL like: https://abc.ngrok.app/checkin?activityId=1&timestamp=xxx&signature=yyy
   */
  generateQrUrl(activityId: number, qrSecret: string): string {
    if (!this.frontendUrl) {
      throw new Error('FRONTEND_URL is not configured');
    }

    const timestamp = Date.now();
    const signature = this.generateSignature(activityId, timestamp, qrSecret);

    return `${this.frontendUrl}/checkin?activityId=${activityId}&timestamp=${timestamp}&signature=${signature}`;
  }

  /**
   * Generate HMAC-SHA256 signature
   * 
   * Signature = HMAC-SHA256(activityId:timestamp, qrSecret)
   * 
   * @param activityId - Activity ID
   * @param timestamp - Timestamp when QR was generated
   * @param qrSecret - Secret key
   * @returns Hex signature
   */
  private generateSignature(activityId: number, timestamp: number, qrSecret: string): string {
    const data = `${activityId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', qrSecret);
    hmac.update(data);
    const signature = hmac.digest('hex');
    
    this.logger.debug(
      `Generated signature for activityId=${activityId}, timestamp=${timestamp}`,
    );
    
    return signature;
  }

  /**
   * Verify QR code signature
   * 
   * Recalculates signature and compares with provided signature
   * 
   * @param activityId - Activity ID from QR
   * @param timestamp - Timestamp from QR
   * @param signature - Signature from QR
   * @param qrSecret - Secret key from database
   * @returns true if signature is valid, false otherwise
   */
  verifySignature(
    activityId: number,
    timestamp: number,
    signature: string,
    qrSecret: string,
  ): boolean {
    const expectedSignature = this.generateSignature(activityId, timestamp, qrSecret);
    const isValid = expectedSignature === signature;

    if (!isValid) {
      this.logger.warn(
        `Signature verification failed for activityId=${activityId}. Expected: ${expectedSignature}, Got: ${signature}`,
      );
    }

    return isValid;
  }

  /**
   * Check if QR timestamp is expired
   * Default expiration: 10 minutes
   * 
   * @param timestamp - Timestamp from QR
   * @param maxAgeMs - Maximum age in milliseconds (default: 10 minutes)
   * @returns true if NOT expired, false if expired
   */
  isTimestampValid(timestamp: number, maxAgeMs: number = 10 * 60 * 1000): boolean {
    const age = Date.now() - timestamp;
    const isValid = age <= maxAgeMs;

    if (!isValid) {
      this.logger.warn(
        `QR timestamp expired. Age: ${age}ms, Max: ${maxAgeMs}ms`,
      );
    }

    return isValid;
  }
}
