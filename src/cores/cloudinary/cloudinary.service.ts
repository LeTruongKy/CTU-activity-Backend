import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import type { Express } from 'express';

interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  size: number;
  format: string;
}

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinaryInstance: typeof cloudinary,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new HttpException('No file provided', HttpStatus.BAD_REQUEST));
        return;
      }

      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        reject(
          new HttpException(
            'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
            HttpStatus.BAD_REQUEST,
          ),
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(
          new HttpException(
            'File size exceeds 5MB limit',
            HttpStatus.BAD_REQUEST,
          ),
        );
        return;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ctu_activities',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error: UploadApiErrorResponse | undefined, result: any) => {
          if (error) {
            reject(
              new HttpException(
                `Cloudinary upload failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else if (!result) {
            reject(
              new HttpException(
                'Cloudinary upload failed: No response received',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            const uploadResult: CloudinaryUploadResult = {
              public_id: result.public_id,
              url: result.url,
              secure_url: result.secure_url,
              size: result.bytes,
              format: result.format,
            };
            resolve(uploadResult);
          }
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImageToFolder(file: Express.Multer.File, folder: string): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new HttpException('No file provided', HttpStatus.BAD_REQUEST));
        return;
      }

      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        reject(
          new HttpException(
            'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
            HttpStatus.BAD_REQUEST,
          ),
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(
          new HttpException(
            'File size exceeds 5MB limit',
            HttpStatus.BAD_REQUEST,
          ),
        );
        return;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error: UploadApiErrorResponse | undefined, result: any) => {
          if (error) {
            reject(
              new HttpException(
                `Cloudinary upload failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else if (!result) {
            reject(
              new HttpException(
                'Cloudinary upload failed: No response received',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            const uploadResult: CloudinaryUploadResult = {
              public_id: result.public_id,
              url: result.url,
              secure_url: result.secure_url,
              size: result.bytes,
              format: result.format,
            };
            resolve(uploadResult);
          }
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error: UploadApiErrorResponse | undefined, result: any) => {
        if (error) {
          reject(
            new HttpException(
              `Cloudinary delete failed: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        } else {
          resolve(result);
        }
      });
    });
  }
}
