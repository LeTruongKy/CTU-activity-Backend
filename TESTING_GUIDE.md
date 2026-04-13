# 🧪 Testing Guide: Hệ Thống Recommendation

## 📋 Tổng Quan

Sau khi seed 10 activities, bạn cần test hệ thống Hybrid Recommendation (Content-Based + Collaborative Filtering).

---

## 🚀 Setup Ban Đầu

### **Bước 1: Tạo Categories & Tags**
```bash
# Chạy SQL script từ terminal
psql -U your_user -d ctu_activity_db -f seed-categories-tags.sql
```

### **Bước 2: Chạy Recommendation Service**
```bash
# Terminal 1: NestJS Backend
cd ctu-activity-backend
npm run dev

# Terminal 2: Python Recommendation Service
cd recommendation-service
python app/main.py
# Hoặc: python -m uvicorn app.main:app --reload --port 8001
```

### **Bước 3: Seed 10 Activities**
```bash
# Gọi API
curl -X POST http://localhost:3000/activities/seed

# Hoặc dùng Postman:
POST http://localhost:3000/activities/seed
```

---

## 🎯 Test 1: Kiểm Tra Basic Functionality

### **1.1 Xem 10 Activities Vừa Tạo**
```bash
curl http://localhost:3000/activities

# Hoặc với filter
curl "http://localhost:3000/activities?status=PUBLISHED&page=1&limit=10"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Đá bóng",
      "description": "...",
      "status": "PUBLISHED",
      "posterUrl": "/1.jpg",
      "maxParticipants": 100,
      "startTime": "2026-05-15T10:00:00Z",
      "endTime": "2026-05-15T12:00:00Z"
    },
    // ... 9 hoạt động khác
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### **1.2 Xem Chi Tiết 1 Activity**
```bash
curl http://localhost:3000/activities/1

# Response
{
  "message": "Activity details",
  "activity": {
    "id": 1,
    "title": "Đá bóng",
    "tags": [
      { "id": 1, "name": "Sports" },
      { "id": 2, "name": "Team Work" }
    ],
    "categoryId": 1,
    "category": { "name": "Sports" }
  }
}
```

---

## 📊 Test 2: Content-Based Recommendation

### **2.1 Lấy Recommendations dựa trên Tags (Content)**

```bash
curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440000"

# Parameters:
# - userId: UUID của user
# - limit: số gợi ý (default 10)
```

**Expected Response:**
```json
{
  "message": "Recommendations retrieved successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "total_count": 5,
    "recommendations": [
      {
        "activity_id": 1,
        "activity_title": "Đá bóng",
        "description": "Giải đá bóng...",
        "status": "PUBLISHED",
        "tags": ["Sports", "Team Work"],
        "similarity_score": 0.95,        // Content-Based (TF-IDF)
        "collaborative_score": 0.72,    // Collaborative (User-User)
        "final_score": 0.87,            // Hybrid (60% content + 40% collab)
        "score_breakdown": {
          "content_based_weight": 0.60,
          "collaborative_weight": 0.40
        }
      }
    ]
  }
}
```

---

## 👥 Test 3: Collaborative Filtering (Yêu Cầu Registrations)

### **Chuẩn Bị: Tạo User Registrations**

Collaborative Filtering cần data về user interactions (ai đã join hoạt động nào).

```bash
# 1. Tạo vài user test (hoặc dùng user existing)
# User A: 550e8400-e29b-41d4-a716-446655440001
# User B: 550e8400-e29b-41d4-a716-446655440002
# User C: 550e8400-e29b-41d4-a716-446655440003

# 2. User A join activities: 1, 3, 7 (Sports & Team Work)
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "activityId": 1,
    "status": "CONFIRMED"
  }'

# Lặp lại cho activity 3, 7

# 3. User B join activities: 2, 4, 9 (Volunteer & Community)
# 4. User C join activities: 5, 6, 10 (Events & Leadership)
```

### **3.1 Test Collaborative Score**

Sau khi có registrations, test lại recommendation:

```bash
# Gợi ý cho User A (đã join sports activities)
curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440001?limit=5"
```

**Expected Behavior:**
- Activities yang User A chưa join nhưng User B & C join sẽ có collaborative_score cao
- Ví dụ: Nếu User A join Sports activities (1,3,7), sẽ được gợi ý activities có Tags tương tự từ Users khác

```json
{
  "recommendations": [
    {
      "activity_id": 8,
      "activity_title": "Đá bóng khu C",
      "similarity_score": 0.92,        // Cao vì cùng Sport tags
      "collaborative_score": 0.85,    // Cao vì users khác join
      "final_score": 0.89             // 0.92*0.6 + 0.85*0.4
    }
  ]
}
```

---

## 📈 Test 4: Score Breakdown Analysis

### **4.1 Kiểm Tra Weighting (60% Content + 40% Collaborative)**

```javascript
// Manual calculation
const similarity_score = 0.92;      // TF-IDF from content
const collaborative_score = 0.85;   // User similarity
const final_score = (similarity_score * 0.60) + (collaborative_score * 0.40);
// = 0.92 * 0.6 + 0.85 * 0.4
// = 0.552 + 0.34
// = 0.892
```

### **4.2 Edge Cases:**

```bash
# Test 1: User không tồn tại
curl "http://localhost:3000/activities/recommendations/00000000-0000-0000-0000-000000000000"
# Expected: Empty recommendations hoặc error message

# Test 2: Limit parameter
curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440001?limit=3"
# Expected: Chỉ trả 3 gợi ý

# Test 3: User không join activity nào
curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440099"
# Expected: Có thể trả Content-Based gợi ý hoặc empty (tùy logic)
```

---

## 🔍 Test 5: Database Inspection

### **5.1 Kiểm Tra Activities**
```sql
SELECT id, title, status, createdBy, posterUrl, maxParticipants
FROM activities
WHERE createdBy = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY id;
```

**Expected:** 10 activities với status = 'PUBLISHED'

### **5.2 Kiểm Tra Activity-Tags**
```sql
SELECT 
  a.id as activity_id,
  a.title,
  t.name as tag_name,
  t.id as tag_id
FROM activity_tags at
JOIN activities a ON at.activityId = a.id
JOIN tags t ON at.tagId = t.id
WHERE a.createdBy = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY a.id, t.id;
```

**Expected:** Mỗi activity có 3 tags phù hợp

### **5.3 Kiểm Tra Registrations**
```sql
SELECT 
  r.id,
  r.activityId,
  a.title,
  r.userId,
  r.status
FROM activity_registrations r
JOIN activities a ON r.activityId = a.id
WHERE a.createdBy = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY r.userId, r.activityId;
```

---

## 📊 Test 6: API Performance Testing

### **6.1 Load Testing Recommendations**

```bash
# Test response time cho recommendation API
time curl "http://localhost:3000/activities/recommendations/550e8400-e29b-41d4-a716-446655440001?limit=10"

# Expected: < 500ms
```

### **6.2 Bulk Recommendation Test**

```bash
# Test với nhiều users
for i in {1..5}; do
  USER_ID="550e8400-0000-0000-0000-00000000000$i"
  curl -s "http://localhost:3000/activities/recommendations/$USER_ID" | jq '.data | length'
done
```

---

## ✅ Checklist Kiểm Tra

### **Before Testing:**
- [ ] Backend running on port 3000
- [ ] Python Recommendation Service running on port 8001
- [ ] PostgreSQL database connected
- [ ] Categories & Tags created (via SQL script)
- [ ] 10 Activities seeded (via /activities/seed endpoint)

### **Content-Based Tests:**
- [ ] GET /activities trả 10 activities
- [ ] GET /activities/:id trả đúng chi tiết
- [ ] GET /recommendations/:userId trả gợi ý dựa trên tags
- [ ] similarity_score > 0 cho matching tags

### **Collaborative Tests:**
- [ ] Tạo registrations cho 3-4 users
- [ ] collaborative_score tăng sau khi có registrations
- [ ] final_score = similarity * 0.6 + collaborative * 0.4

### **Edge Cases:**
- [ ] Non-existent user ID
- [ ] Empty registrations
- [ ] Limit parameter works
- [ ] Error handling

---

## 🐛 Troubleshooting

### **❌ Recommendation API timeout**
```
Giải pháp:
1. Kiểm tra Python service chạy không: ps aux | grep uvicorn
2. Check logs: tail -f recommendation-service/logs.txt
3. Restart service
```

### **❌ No recommendations returned**
```
Giải pháp:
1. Kiểm tra activities có tags không: SELECT * FROM activity_tags;
2. Kiểm tra user_id đúng không
3. Check Python service logs
```

### **❌ similarity_score = 0**
```
Giải pháp:
1. Kích hoạt user interests trước: POST /users/{id}/interests
2. Kiểm tra tags mapping đúng không
3. Check vectorization trong Python service
```

### **❌ collaborative_score = 0**
```
Giải pháp:
1. Kiểm tra registrations tồn tại: SELECT COUNT(*) FROM activity_registrations;
2. Nếu < 5 registrations → Collaborative chưa hoạt động
3. Cần ít nhất 3-4 users join activities để collaborative score có ý nghĩa
```

---

## 📝 Test Scenarios

### **Scenario 1: New User (Chỉ Content-Based)**
```
User mới không có registration
→ collaborative_score = 0 hoặc đánh trọng số thấp
→ final_score ≈ similarity_score * 0.6
```

### **Scenario 2: Active User (Content + Collaborative)**
```
User join 5 activities
→ Kiểm tra similarity_score: từ tags
→ Kiểm tra collaborative_score: từ users khác cùng sở thích
→ final_score = mix cả hai
```

### **Scenario 3: Similar Users**
```
User A & B join cùng activities
→ Khi lấy gợi ý cho A, activities B join sẽ có collaborative_score cao
→ Ngay cả khi A chưa join
```

---

## 🎓 Expected Test Results

| Test Name | Expected | Actual | Status |
|-----------|----------|--------|--------|
| 10 Activities Created | 10 rows | ? | ⏳ |
| All Status = PUBLISHED | 100% | ? | ⏳ |
| Tags assigned | 30 rows (10*3) | ? | ⏳ |
| Similarity Score > 0 | ✓ | ? | ⏳ |
| Collaborative Score > 0 | ✓ (after registrations) | ? | ⏳ |
| Final Score = 0.6*sim + 0.4*collab | ✓ | ? | ⏳ |
| Response Time < 500ms | ✓ | ? | ⏳ |

---

**Sau khi hoàn thành tất cả tests → Hệ thống recommendation sẵn sàng sử dụng!** ✅
