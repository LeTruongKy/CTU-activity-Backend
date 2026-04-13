# 🚀 Hướng Dẫn: Tạo 10 Hoạt Động Bằng API

## 📋 3 Cách Tạo 10 Hoạt Động

---

## **Cách 1️⃣: Dùng /seed Endpoint (Nhanh nhất - 1 lệnh)**

### Dùng cURL:
```bash
curl -X POST http://localhost:3000/activities/seed
```

### Hoặc Postman:
```
Method: POST
URL: http://localhost:3000/activities/seed
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Tạo thành công 10 hoạt động mẫu cho testing",
  "total": 10,
  "details": {
    "activities": 10,
    "activity_tags": 30,
    "status": "PUBLISHED",
    "year": 2026
  }
}
```

---

## **Cách 2️⃣: Dùng PowerShell Script (Windows)**

### Bước 1: Mở PowerShell
```powershell
# Vào thư mục project
cd d:\Hoc_Tap\LVTN\CTUActivityBackend\ctu-activity-backend
```

### Bước 2: Chạy script
```powershell
.\create-10-activities-api.ps1
```

**Output:**
```
🌱 Bắt đầu tạo 10 hoạt động...

[1/10] Tạo: Đá bóng
✅ ID: 1

[2/10] Tạo: Xuân san sẻ
✅ ID: 2

...

✅ Hoàn thành! 10/10 hoạt động đã được tạo.
```

---

## **Cách 3️⃣: Dùng Bash Script (Linux/Mac)**

### Bước 1: Cấp quyền chạy
```bash
chmod +x create-10-activities-api.sh
```

### Bước 2: Chạy script
```bash
./create-10-activities-api.sh
```

---

## **Cách 4️⃣: Dùng Postman Collection**

### Bước 1: Import Collection
1. Mở Postman
2. Click **Import** → Select file `Postman_10_Activities.json`
3. Chọn **Import**

### Bước 2: Chạy Collection
1. Click vào collection **"CTU Activity - Create 10 Activities"**
2. Click **...** → **Run collection**
3. Configurations:
   - **Iterations:** 1
   - **Delay:** 500ms (tránh overload)
4. Click **Run**

**Result:** Tất cả 10 requests sẽ chạy tự động, mỗi activity được tạo

---

## **Cách 5️⃣: Manual cURL (Chi tiết)**

Nếu muốn tạy từng activity riêng biệt:

### Activity 1: Đá bóng
```bash
curl -X POST http://localhost:3000/activities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đá bóng",
    "description": "Giải đá bóng nam...",
    "posterUrl": "/1.jpg",
    "location": "Sân bóng đá trường",
    "categoryId": 1,
    "unitId": 1,
    "maxParticipants": 100,
    "startTime": "2026-05-15T10:00:00Z",
    "endTime": "2026-05-15T12:00:00Z",
    "tags": [1, 2]
  }'
```

### Activity 2: Xuân san sẻ
```bash
curl -X POST http://localhost:3000/activities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Xuân san sẻ",
    "description": "Chương trình xuân sang...",
    "posterUrl": "/2.jpg",
    "location": "Sân trường",
    "categoryId": 3,
    "unitId": 2,
    "maxParticipants": 150,
    "startTime": "2026-02-10T14:00:00Z",
    "endTime": "2026-02-10T16:30:00Z",
    "tags": [3, 4]
  }'
```

...và tương tự với 8 activities còn lại (xem trong Postman Collection)

---

## 📊 Dữ Liệu 10 Hoạt Động

| # | Tên | Ảnh | Category | Người | Tags |
|-|-|-|-|-|-|
| 1 | Đá bóng | /1.jpg | Sports (1) | 100 | 1,2 |
| 2 | Xuân san sẻ | /2.jpg | Volunteer (3) | 150 | 3,4 |
| 3 | Hội trại | /3.jpg | Events (2) | 200 | 2,5 |
| 4 | Hoa điểm tốt | /4.jpg | Academic (4) | 80 | 6,7 |
| 5 | Đại hội | /5.jpg | Leadership (5) | 500 | 8,5 |
| 6 | Trung thu | /6.jpg | Cultural (2) | 300 | 9,10 |
| 7 | Chạy bộ | /7.jpg | Sports (1) | 250 | 1,11 |
| 8 | Đá bóng khu C | /8.jpg | Sports (1) | 60 | 1,2 |
| 9 | Tình nguyện | /9.jpg | Volunteer (3) | 120 | 3,4,12 |
| 10 | Vẽ nên ước mơ | /10.jpg | Arts (4) | 80 | 13,6 |

---

## ✅ Checklist Trước Khi Tạo

- [ ] Backend running: `npm run dev`
- [ ] Database connected
- [ ] Categories được tạo (nếu chưa: chạy `seed-categories-tags.sql`)
- [ ] Tags được tạo (nếu chưa: chạy `seed-categories-tags.sql`)
- [ ] Port 3000 không bị block

---

## 🔍 Xác Nhận Thành Công

### Kiểm tra trong Database:
```sql
-- Xem 10 activities
SELECT id, title, status, posterUrl FROM activities 
WHERE createdBy = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY id
LIMIT 10;

-- Output: 10 rows
```

### Hoặc dùng API:
```bash
curl http://localhost:3000/activities

# Response: Có 10+ activities
```

---

## 🎯 Khuyến Nghị

### **Nên Dùng Cách 1 (Seed Endpoint)** nếu:
- Muốn tạo nhanh nhất
- Không cần customize data

### **Nên Dùng Cách 2 (PowerShell Script)** nếu:
- Dùng Windows
- Muốn thấy progress từng hoạt động

### **Nên Dùng Cách 3 (Bash Script)** nếu:
- Dùng Linux/Mac
- Muốn shell script tự động

### **Nên Dùng Cách 4 (Postman Collection)** nếu:
- Muốn UI visual
- Dễ debug từng request
- Không quen dùng terminal

### **Nên Dùng Cách 5 (Manual cURL)** nếu:
- Muốn tạy từng activity riêng
- Cần customize data

---

## ⚠️ Lưu Ý

### **Không chạy 2 lần**
- Chạy seed xong, **KHÔNG chạy lại** hoặc duplicate

### **Nếu muốn reset:**
```sql
DELETE FROM activity_tags WHERE activityId IN 
  (SELECT id FROM activities WHERE createdBy = '550e8400-e29b-41d4-a716-446655440001');
DELETE FROM activities WHERE createdBy = '550e8400-e29b-41d4-a716-446655440001';
```
Rồi chạy seed lại.

### **Error: Categories/Tags không tìm thấy**
- Cần chạy `seed-categories-tags.sql` trước
- Hoặc sửa categoryId/tagIds để match với DB hiện tại

---

## 📝 Các Files Được Cung Cấp

| File | Dùng Cho |
|------|---------|
| `create-10-activities-api.ps1` | PowerShell script (Windows) |
| `create-10-activities-api.sh` | Bash script (Linux/Mac) |
| `Postman_10_Activities.json` | Postman Collection |
| `ctu-activity-backend-api-create-10.md` | File này |

---

## 🎉 Xong!

Chọn cách phù hợp và tạo 10 hoạt động ngay thôi!

**Gợi ý:** Cách 1 (Seed endpoint) là nhanh và đơn giản nhất. 👍
