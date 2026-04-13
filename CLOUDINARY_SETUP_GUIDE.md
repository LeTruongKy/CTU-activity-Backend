# Cloudinary Poster Upload - Implementation Guide

## 📋 Tổng Quan Triển Khai

Các file đã được cập nhật để hỗ trợ tải lên poster hoạt động sử dụng Cloudinary:

### 1. **Database & Entity**
- ✅ **File**: `src/modules/activities/entities/activity.entity.ts`
- **Thay đổi**: Thêm cột `posterUrl: string | null` để lưu trữ URL ảnh Cloudinary

### 2. **DTOs (Data Transfer Objects)**
- ✅ **CreateActivityDto**: `src/modules/activities/dto/create-activity.dto.ts`
  - Thêm field: `posterUrl?: string` (cho phép gửi URL trực tiếp)
  
- ✅ **UpdateActivityDto**: `src/modules/activities/dto/update-activity.dto.ts`
  - Thêm field: `posterUrl?: string` (cho phép cập nhật URL)

### 3. **Cloudinary Service**
- ✅ **Provider**: `src/cores/cloudinary/cloudinary.provider.ts`
  - Cấu hình Cloudinary từ `ConfigService` (.env variables)
  
- ✅ **Service**: `src/cores/cloudinary/cloudinary.service.ts`
  - `uploadImage(file)`: Upload ảnh lên folder `ctu_activities` trên Cloudinary
  - `deleteImage(publicId)`: Xóa ảnh khỏi Cloudinary
  - Xác thực: chỉ cho phép JPEG, PNG, GIF, WebP (tối đa 5MB)
  
- ✅ **Module**: `src/cores/cloudinary/cloudinary.module.ts`
  - Đăng ký CloudinaryService như một provider có thể sử dụng trong các modules khác

### 4. **Controller Update**
- ✅ **File**: `src/modules/activities/activities.controller.ts`
- **Thay đổi**: 
  - Thêm `@UseInterceptors(FileInterceptor('file'))`
  - Thêm parameter `@UploadedFile() file?: Express.Multer.File`
  - Truyền file đến service cho xử lý

### 5. **Service Logic Update**
- ✅ **File**: `src/modules/activities/activities.service.ts`
- **Thay đổi**:
  - Inject `CloudinaryService`
  - Update `create()` method để nhận file parameter
  - Gọi `cloudinaryService.uploadImage(file)` nếu file tồn tại
  - Lưu `secure_url` vào `posterUrl` trong database
  - Xử lý lỗi upload

---

## 🔐 Environment Configuration

File `.env` đã được cấu hình với credentials Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=de5nib2be
CLOUDINARY_API_KEY=932863789461582
CLOUDINARY_API_SECRET=hURB_sZpu5PYJyCOkMptjP5lsiU
```

**Lưu ý bảo mật**: 
- ✅ Không code cứng credentials
- ✅ Sử dụng `ConfigService` để load từ `.env`
- ✅ Không commit `.env` vào Git (kiểm tra `.gitignore`)

---

## 📡 API Usage

### Create Activity with Poster

**Endpoint**: `POST /activities`

**Headers**:
```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
```

**Body** (multipart/form-data):
```
- file: <image_file> (optional)
- title: "Hoạt động học tập"
- description: "Mô tả hoạt động"
- unitId: 1
- categoryId: 2
- location: "Phòng 101"
- startTime: "2024-03-20T09:00:00Z"
- endTime: "2024-03-20T11:00:00Z"
- maxParticipants: 50
- criteriaIds: [1, 2, 3]
```

**Success Response** (201):
```json
{
  "message": "Activity created successfully",
  "activity": {
    "id": 123,
    "title": "Hoạt động học tập",
    "description": "Mô tả hoạt động",
    "posterUrl": "https://res.cloudinary.com/de5nib2be/image/upload/v1234567890/ctu_activities/xyz.jpg",
    "location": "Phòng 101",
    "startTime": "2024-03-20T09:00:00Z",
    "endTime": "2024-03-20T11:00:00Z",
    "createdAt": "2024-03-14T10:30:00Z",
    "status": "PENDING"
  }
}
```

**Error Responses**:
- 400: File loại tệp không hợp lệ
- 400: File vượt quá 5MB
- 400: Lỗi upload Cloudinary
- 401: Không được xác thực
- 403: Không đủ quyền

---

## 🧪 Testing with cURL

### Tạo activity với poster:
```bash
curl -X POST http://localhost:3000/activities \
  -H "Authorization: Bearer <jwt_token>" \
  -F "title=Hoạt động mới" \
  -F "description=Mô tả" \
  -F "unitId=1" \
  -F "startTime=2024-03-20T09:00:00Z" \
  -F "endTime=2024-03-20T11:00:00Z" \
  -F "file=@/path/to/image.jpg"
```

### Tạo activity mà không có poster:
```bash
curl -X POST http://localhost:3000/activities \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hoạt động mới",
    "description": "Mô tả",
    "unitId": 1,
    "startTime": "2024-03-20T09:00:00Z",
    "endTime": "2024-03-20T11:00:00Z"
  }'
```

---

## File Specifications

### Hỗ trợ các định dạng ảnh:
- ✅ JPEG (image/jpeg)
- ✅ PNG (image/png)
- ✅ GIF (image/gif)
- ✅ WebP (image/webp)

### Giới hạn:
- **Kích thước tối đa**: 5MB
- **Thư mục Cloudinary**: `ctu_activities/`

---

## 🔄 Database Migration

Sau khi cập nhật entity, chạy migration để cập nhật schema:

```bash
# Nếu sử dụng TypeORM synchronize (dev mode - tự động)
npm run start:dev

# Nếu cần tạo migration thủ công:
npm run typeorm migration:generate -- -n AddPosterUrlToActivity
npm run typeorm migration:run
```

---

## 📦 Dependencies Cài Đặt

Đã cài đặt:
```json
{
  "cloudinary": "^2.x.x",
  "streamifier": "^0.1.x",
  "@nestjs/platform-express": "^11.x.x"
}
```

Nếu thiếu, cài đặt thủ công:
```bash
npm install cloudinary streamifier
```

---

## ⚠️ Troubleshooting

### 1. Error: "Cloudinary credentials not found"
**Giải pháp**: Kiểm tra `.env` file có các biến:
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 2. Error: "File upload failed"
**Giải pháp**: 
- Kiểm tra định dạng file (chỉ hỗ trợ JPEG, PNG, GIF, WebP)
- Kiểm tra kích thước file (max 5MB)

### 3. Error: "No file provided"
**Giải pháp**: 
- Đảm bảo file được gửi với key `file` trong form data
- Nếu không gửi file, posterUrl sẽ là `null`

### 4. posterUrl không được lưu
**Giải pháp**:
- Kiểm tra upload thành công từ Cloudinary
- Xác minh các credentials Cloudinary

---

## 📊 Database Schema

```sql
-- new column in activities table
ALTER TABLE activities ADD COLUMN poster_url VARCHAR(500) NULL;
```

**TypeORM Entity Definition**:
```typescript
@Column({ type: 'varchar', length: 500, nullable: true })
posterUrl: string | null;
```

---

## ✅ Danh Sách Thực Hiện

- [x] Cập nhật Activity entity thêm `posterUrl`
- [x] Cập nhật CreateActivityDto & UpdateActivityDto
- [x] Tạo Cloudinary provider
- [x] Tạo Cloudinary service (upload/delete)
- [x] Tạo Cloudinary module
- [x] Cập nhật Activities controller (FileInterceptor)
- [x] Cập nhật Activities service (handle file upload)
- [x] Cấu hình .env với Cloudinary credentials
- [x] Cài đặt dependencies (cloudinary, streamifier)

---

## 🚀 Bước Tiếp Theo

1. **Test API** với Postman/cURL
2. **Xác thực** posterUrl được lưu vào database
3. **Kiểm tra** ảnh xuất hiện trên Cloudinary dashboard
4. **Deploy** sau khi test thành công

---

## 📝 Ghi Chú Thêm

- File upload là **optional** - có thể tạo activity mà không có poster
- Nếu cả file lẫn posterUrl DTO được gửi, file upload sẽ được ưu tiên
- Cloudinary sẽ tự động optimize hình ảnh (quality auto, fetch_format auto)
- Ảnh được lưu vào folder `ctu_activities` cho dễ quản lý

---

**Hoàn thành ngày**: Tháng Ba 2026  
**Phiên bản**: 1.0
