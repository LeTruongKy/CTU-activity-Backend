# Cloudinary Poster Upload Implementation - Summary

## 📝 Tóm Tắt Các Thay Đổi

### ✅ Hoàn Thành Tất Cả 6 Bước

---

## 1️⃣ Database & Entity Updates

### File: `src/modules/activities/entities/activity.entity.ts`

**Thay đổi**: Thêm cột posterUrl
```typescript
@Column({ type: 'varchar', length: 500, nullable: true })
posterUrl: string | null;
```

**Vị trí**: Sau cột `location`, trước cột `startTime`

---

## 2️⃣ DTO Updates

### File: `src/modules/activities/dto/create-activity.dto.ts`

**Thay đổi**: Thêm field posterUrl
```typescript
@IsString()
@IsOptional()
@MaxLength(500)
posterUrl?: string;
```

### File: `src/modules/activities/dto/update-activity.dto.ts`

**Thay đổi**: Thêm field posterUrl
```typescript
@IsString()
@IsOptional()
@MaxLength(500)
posterUrl?: string;
```

---

## 3️⃣ Cloudinary Configuration

### File: `src/cores/cloudinary/cloudinary.provider.ts` (NEW)

Cấu hình Cloudinary từ environment variables:
```typescript
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  },
};
```

### File: `src/cores/cloudinary/cloudinary.service.ts` (NEW)

Dịch vụ xử lý upload và xóa ảnh:
```typescript
@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinaryInstance: typeof cloudinary,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<any>
  async deleteImage(publicId: string): Promise<any>
}
```

**Tính năng**:
- ✅ Xác thực định dạng file (JPEG, PNG, GIF, WebP)
- ✅ Kiểm tra kích thước (max 5MB)
- ✅ Upload với stream (buffer-friendly)
- ✅ Auto optimize và converting format
- ✅ Lưu vào folder `ctu_activities`
- ✅ Xử lý lỗi chi tiết

### File: `src/cores/cloudinary/cloudinary.module.ts` (NEW)

Module NestJS export CloudinaryService:
```typescript
@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
```

---

## 4️⃣ Environment Configuration

### File: `.env` (UPDATED)

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=de5nib2be
CLOUDINARY_API_KEY=932863789461582
CLOUDINARY_API_SECRET=hURB_sZpu5PYJyCOkMptjP5lsiU
```

✅ Đã thêm vào file .env hiện tại

---

## 5️⃣ Controller Updates

### File: `src/modules/activities/activities.controller.ts` (UPDATED)

**Import thêm**:
```typescript
import {
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
```

**POST /activities endpoint**:
```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LCH', 'CH')
@UseInterceptors(FileInterceptor('file'))
async create(
  @Req() req: any,
  @Body() createActivityDto: CreateActivityDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  const activity = await this.activitiesService.create(
    createActivityDto,
    req.user.id,
    file,
  );
  return {
    message: 'Activity created successfully',
    activity,
  };
}
```

---

## 6️⃣ Service Updates

### File: `src/modules/activities/activities.service.ts` (UPDATED)

**Import thêm**:
```typescript
import { CloudinaryService } from '../../cores/cloudinary/cloudinary.service';
```

**Constructor thêm**:
```typescript
constructor(
  // ... existing parameters
  private readonly cloudinaryService: CloudinaryService,
) {}
```

**create() method signature**:
```typescript
async create(
  createActivityDto: CreateActivityDto,
  creatorId: string,
  file?: Express.Multer.File,
) {
  // ... validation code
  
  // Upload image if provided
  let posterUrl: string | null = null;
  if (file) {
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      posterUrl = uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException(
        `Image upload failed: ${error.message}`,
      );
    }
  }

  // Create activity with posterUrl
  const activity = this.activitiesRepository.create({
    // ... other fields
    posterUrl: posterUrl || createActivityDto.posterUrl || null,
    // ... rest of fields
  });

  // ... save and return
}
```

### File: `src/modules/activities/activities.module.ts` (UPDATED)

**Import thêm**:
```typescript
import { CloudinaryModule } from '../../cores/cloudinary/cloudinary.module';
```

**Imports array**:
```typescript
imports: [
  // ... existing imports
  CloudinaryModule,
],
```

---

## 📦 Dependencies Installed

```bash
npm install cloudinary streamifier
```

✅ Cả hai packages đã được cài đặt thành công

---

## 🔀 Flow Diagram

```
API Request (POST /activities)
    ↓
[FileInterceptor]
    ↓
[Controller.create()]
    ↓
[Service.create(file)]
    ↓
[File Validation]
    ├─ Check MIME type
    ├─ Check file size
    └─ Create read stream
    ↓
[CloudinaryService.uploadImage()]
    ├─ Stream to Cloudinary
    ├─ Auto optimize
    └─ Return secure_url
    ↓
[Database Save]
    ├─ Activity data
    ├─ posterUrl = secure_url
    └─ Save to activities table
    ↓
[Response]
    └─ 201 Created with posterUrl
```

---

## 📋 File Locations

```
ctu-activity-backend/
├── src/
│   ├── app.module.ts (No changes needed)
│   ├── cores/
│   │   └── cloudinary/ (NEW)
│   │       ├── cloudinary.module.ts (NEW)
│   │       ├── cloudinary.provider.ts (NEW)
│   │       └── cloudinary.service.ts (NEW)
│   └── modules/
│       └── activities/
│           ├── activities.controller.ts (UPDATED)
│           ├── activities.module.ts (UPDATED)
│           ├── activities.service.ts (UPDATED)
│           ├── dto/
│           │   ├── create-activity.dto.ts (UPDATED)
│           │   └── update-activity.dto.ts (UPDATED)
│           └── entities/
│               └── activity.entity.ts (UPDATED)
├── .env (UPDATED)
├── package.json (UPDATED - dependencies added)
└── CLOUDINARY_SETUP_GUIDE.md (NEW)
```

---

## 🧪 Quick Test

### 1. Start Server
```bash
cd ctu-activity-backend
npm run start:dev
```

### 2. Test with cURL
```bash
curl -X POST http://localhost:3000/activities \
  -H "Authorization: Bearer <your_token>" \
  -F "title=Test Activity" \
  -F "description=Test Description" \
  -F "unitId=1" \
  -F "startTime=2024-03-20T09:00:00Z" \
  -F "endTime=2024-03-20T11:00:00Z" \
  -F "file=@/path/to/image.jpg"
```

### 3. Verify Response
Check if `posterUrl` is present and contains Cloudinary URL:
```json
{
  "activity": {
    "id": 1,
    "title": "Test Activity",
    "posterUrl": "https://res.cloudinary.com/de5nib2be/image/upload/v1234567890/ctu_activities/xyz.jpg"
  }
}
```

---

## ✅ Verification Checklist

- [x] posterUrl column added to Activity entity
- [x] posterUrl added to CreateActivityDto
- [x] posterUrl added to UpdateActivityDto
- [x] Cloudinary provider configured with .env
- [x] Cloudinary service created with upload/delete methods
- [x] Cloudinary module created and exported
- [x] Activities controller updated with FileInterceptor
- [x] Activities service updated to handle file upload
- [x] Activities module imports CloudinaryModule
- [x] .env configured with Cloudinary credentials
- [x] Dependencies installed (cloudinary, streamifier)
- [x] Error handling implemented
- [x] File validation (mime type, size)
- [x] Database mutation ready (synchronize: true)

---

## 🚀 Ready for Testing & Deployment

Tất cả các thay đổi đã hoàn thành. Hệ thống sẵn sàng cho:
1. ✅ Upload poster ảnh lên Cloudinary
2. ✅ Lưu trữ URL Cloudinary vào database
3. ✅ Xử lý lỗi upload chi tiết
4. ✅ Auto optimize ảnh
5. ✅ Bảo mật credentials thông qua .env
6. ✅ Validation file (loại & kích thước)

**Bước tiếp theo**: Kiểm tra & test API, sau đó deploy!

