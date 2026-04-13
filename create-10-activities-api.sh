#!/bin/bash

# 🌱 Script: Tạo 10 hoạt động qua API
# Chạy: bash create-10-activities-api.sh

BASE_URL="http://localhost:3000/activities"
CREATOR_ID="550e8400-e29b-41d4-a716-446655440001"  # Admin ID

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌱 Bắt đầu tạo 10 hoạt động...${NC}\n"

# Activity 1: Đá bóng
echo -e "${BLUE}[1/10]${NC} Tạo: Đá bóng"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đá bóng",
    "description": "Giải đá bóng nam với các trận đấu thử thách kỹ năng. Mở cửa cho tất cả sinh viên yêu thích bóng đá.",
    "posterUrl": "/1.jpg",
    "location": "Sân bóng đá trường Đại học Cần Thơ",
    "categoryId": 1,
    "unitId": 1,
    "maxParticipants": 100,
    "startTime": "2026-05-15T10:00:00Z",
    "endTime": "2026-05-15T12:00:00Z",
    "tags": [1, 2]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 2: Xuân san sẻ
echo -e "${BLUE}[2/10]${NC} Tạo: Xuân san sẻ"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Xuân san sẻ",
    "description": "Chương trình xuân sang - chia sẻ yêu thương, trao quà cho cộng đồng địa phương.",
    "posterUrl": "/2.jpg",
    "location": "Sân trường Đại học Cần Thơ",
    "categoryId": 3,
    "unitId": 2,
    "maxParticipants": 150,
    "startTime": "2026-02-10T14:00:00Z",
    "endTime": "2026-02-10T16:30:00Z",
    "tags": [3, 4]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 3: Hội trại
echo -e "${BLUE}[3/10]${NC} Tạo: Hội trại"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hội trại",
    "description": "Hoạt động hội trại sinh viên với các trò chơi, ca hát, cắm trại đêm.",
    "posterUrl": "/3.jpg",
    "location": "Khu cảnh công viên ngoài trường",
    "categoryId": 2,
    "unitId": 1,
    "maxParticipants": 200,
    "startTime": "2026-04-20T08:00:00Z",
    "endTime": "2026-04-20T22:00:00Z",
    "tags": [2, 5]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 4: Hoa điểm tốt
echo -e "${BLUE}[4/10]${NC} Tạo: Hoa điểm tốt"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hoa điểm tốt",
    "description": "Chương trình trang trí hoa để vinh danh những sinh viên xuất sắc trong học tập.",
    "posterUrl": "/4.jpg",
    "location": "Nhà C Đại học Cần Thơ",
    "categoryId": 4,
    "unitId": 3,
    "maxParticipants": 80,
    "startTime": "2026-06-01T09:00:00Z",
    "endTime": "2026-06-01T11:00:00Z",
    "tags": [6, 7]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 5: Đại hội
echo -e "${BLUE}[5/10]${NC} Tạo: Đại hội"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đại hội",
    "description": "Đại hội sinh viên toàn trường - bầu chọn đại diện sinh viên, thảo luận các chính sách.",
    "posterUrl": "/5.jpg",
    "location": "Hội trường tổ chức Đại học Cần Thơ",
    "categoryId": 5,
    "unitId": 1,
    "maxParticipants": 500,
    "startTime": "2026-03-15T13:00:00Z",
    "endTime": "2026-03-15T17:00:00Z",
    "tags": [8, 5]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 6: Trung thu
echo -e "${BLUE}[6/10]${NC} Tạo: Trung thu"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trung thu",
    "description": "Lễ hội Trung Thu với các hoạt động truyền thống, ăn bánh, chơi đèn lồng.",
    "posterUrl": "/6.jpg",
    "location": "Công viên Sinh viên Cần Thơ",
    "categoryId": 2,
    "unitId": 2,
    "maxParticipants": 300,
    "startTime": "2026-09-20T18:00:00Z",
    "endTime": "2026-09-20T21:00:00Z",
    "tags": [9, 10]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 7: Chạy bộ
echo -e "${BLUE}[7/10]${NC} Tạo: Chạy bộ"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chạy bộ",
    "description": "Sự kiện Marathon tập thế - chạy bộ 5km, 10km để nâng cao sức khỏe sinh viên.",
    "posterUrl": "/7.jpg",
    "location": "Khu vực công viên trường",
    "categoryId": 1,
    "unitId": 1,
    "maxParticipants": 250,
    "startTime": "2026-07-10T06:00:00Z",
    "endTime": "2026-07-10T08:00:00Z",
    "tags": [1, 11]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 8: Đá bóng khu C
echo -e "${BLUE}[8/10]${NC} Tạo: Đá bóng khu nhà C"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đá bóng khu nhà C",
    "description": "Giải bóng đá nội bộ khu nhà C - sân chơi thân thiện cho sinh viên.",
    "posterUrl": "/8.jpg",
    "location": "Sân bóng trước khu nhà C",
    "categoryId": 1,
    "unitId": 3,
    "maxParticipants": 60,
    "startTime": "2026-05-22T16:00:00Z",
    "endTime": "2026-05-22T18:00:00Z",
    "tags": [1, 2]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 9: Tình nguyện
echo -e "${BLUE}[9/10]${NC} Tạo: Chương trình tình nguyện"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chương trình tình nguyện",
    "description": "Hoạt động tình nguyện giúp đỡ cộng đồng - dạy học, vệ sinh môi trường, tặng quà.",
    "posterUrl": "/9.jpg",
    "location": "Làng ngoài thành phố",
    "categoryId": 3,
    "unitId": 2,
    "maxParticipants": 120,
    "startTime": "2026-08-05T07:00:00Z",
    "endTime": "2026-08-05T12:00:00Z",
    "tags": [3, 4, 12]
  }' 2>/dev/null | jq '.activity.id' && echo ""

# Activity 10: Vẽ nên ước mơ
echo -e "${BLUE}[10/10]${NC} Tạo: Vẽ nên những ước mơ"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vẽ nên những ước mơ",
    "description": "Cuộc thi vẽ tranh - sinh viên thể hiện sáng tạo, những ước mơ qua hình ảnh.",
    "posterUrl": "/10.jpg",
    "location": "Phòng triển lãm Đại học Cần Thơ",
    "categoryId": 4,
    "unitId": 1,
    "maxParticipants": 80,
    "startTime": "2026-10-12T08:30:00Z",
    "endTime": "2026-10-12T11:30:00Z",
    "tags": [13, 6]
  }' 2>/dev/null | jq '.activity.id' && echo ""

echo -e "\n${GREEN}✅ Hoàn thành! 10 hoạt động đã được tạo.${NC}"
