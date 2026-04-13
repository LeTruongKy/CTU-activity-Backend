# ⚡ Quick Start: Seed Activities & Test Recommendation

## 🎯 Mục Tiêu
Tạo 10 hoạt động mẫu trong database và test hệ thống Hybrid Recommendation.

---

## 🚀 3 Bước Nhanh

### **Bước 1: Tạo Categories & Tags (30 giây)**
```bash
# Chạy SQL script
psql -U postgres -d ctu_activity_db -f seed-categories-tags.sql

# Hoặc nếu dùng pgAdmin: Copy-paste SQL vào query window
```

### **Bước 2: Seed 10 Activities (1 phút)**
```bash
# Đảm bảo backend chạy
cd ctu-activity-backend && npm run dev

# Mở browser hoặc Postman
POST http://localhost:3000/activities/seed

# Hoặc dùng curl
curl -X POST http://localhost:3000/activities/seed
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Tạo thành công 10 hoạt động mẫu cho testing",
  "total": 10
}
```

### **Bước 3: Test Recommendation (1 phút)**
```bash
# Lấy gợi ý cho user
curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440000"

# Hoặc Postman:
GET http://localhost:3000/activities/recommendations/{userId}?limit=10
```

---

## 📊 Data Được Tạo

```
✅ 10 Activities:
  1. Đá bóng              → /1.jpg    (Sports)
  2. Xuân san sẻ          → /2.jpg    (Volunteer)
  3. Hội trại            → /3.jpg    (Events)
  4. Hoa điểm tốt        → /4.jpg    (Academic)
  5. Đại hội             → /5.jpg    (Leadership)
  6. Trung thu           → /6.jpg    (Cultural)
  7. Chạy bộ             → /7.jpg    (Sports)
  8. Đá bóng khu C       → /8.jpg    (Sports)
  9. Tình nguyện         → /9.jpg    (Volunteer)
  10. Vẽ nên ước mơ      → /10.jpg   (Arts)

✅ 5 Categories:
  1. Sports, 2. Cultural/Events, 3. Volunteer, 4. Academic, 5. Leadership

✅ 13 Tags:
  Sports, Team Work, Volunteer, Community, Social, Academic, Recognition,
  Leadership, Cultural, Celebration, Health, Service, Arts
```

---

## 🔧 Configuration

### **Tuỳ chỉnh Creator ID**
```typescript
// Trong activities.service.ts, hàm seedActivities()
// Mặc định: '550e8400-e29b-41d4-a716-446655440001'
// Thay đổi URI để dùng user ID khác:

await this.activitiesService.seedActivities('your-custom-uuid');
```

### **Tuỳ chỉnh Data**
Nếu cần thay đổi 10 activities, edit trong `seedActivities()`:
```typescript
const seedData = [
  {
    title: 'Tên hoạt động',
    description: 'Mô tả...',
    posterUrl: '/X.jpg',
    categoryId: 1,
    unitId: 1,
    maxParticipants: 100,
    tagIds: [1, 2],
  },
  // ...
];
```

---

## 📁 Files Được Tạo/Sửa Đổi

| File | Thay Đổi | Mục Đích |
|------|---------|---------|
| `activities.service.ts` | `+ seedActivities()` | Tạo 10 activities |
| `activities.controller.ts` | `+ POST /seed` | Gọi service |
| `SEED_ACTIVITIES_GUIDE.md` | ✅ Tạo mới | Hướng dẫn chi tiết |
| `TESTING_GUIDE.md` | ✅ Tạo mới | Test recommendation |
| `seed-categories-tags.sql` | ✅ Tạo mới | Tạo categories/tags |

---

## ⚠️ Lưu Ý Quan Trọng

### **❌ KHÔNG chạy seed lại sau khi thành công**
Sẽ tạo duplicate data! Nếu muốn chạy lại:
```sql
DELETE FROM activity_tags WHERE activityId IN 
  (SELECT id FROM activities WHERE createdBy = '550e8400-e29b-41d4-a716-446655440001');
DELETE FROM activities WHERE createdBy = '550e8400-e29b-41d4-a716-446655440001';
```

### **⚠️ Yêu Cầu**
- Backend NestJS chạy port 3000
- PostgreSQL database kết nối
- Categories & Tags đã được tạo
- Folder `/public` có files `/1.jpg` → `/10.jpg` (hoặc seed sẽ tạo URLs nhưng hình không tồn tại)

---

## 🧪 Test Nhanh

### **Test 1: Xem 10 Activities**
```bash
curl http://localhost:3000/activities
```
Kỳ vọng: Trả về 10 activities với status = "PUBLISHED"

### **Test 2: Xem 1 Activity**
```bash
curl http://localhost:3000/activities/1
```
Kỳ vọng: Chi tiết activity 1 với tags, category

### **Test 3: Recommendation (Content-Based)**
```bash
curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440000"
```
Kỳ vọng: Gợi ý dựa trên similarity_score từ tags

---

## 📚 Tài Liệu Thêm

- **Chi tiết hơn:** → `SEED_ACTIVITIES_GUIDE.md`
- **Test toàn diện:** → `TESTING_GUIDE.md`
- **SQL setup:** → `seed-categories-tags.sql`

---

## ✅ Checklist

- [ ] SQL script chạy thành công
- [ ] Backend running
- [ ] Gọi POST `/activities/seed`
- [ ] Kiểm tra response success = true
- [ ] Xem database có 10 activities
- [ ] Test GET /activities → trả 10
- [ ] Test recommendation API
- [ ] Kiểm tra similarity_score > 0

---

**Xong! Bây giờ bạn có 10 hoạt động mẫu sẵn sàng test hệ thống recommendation! 🎉**
