# 🌱 PowerShell Script: Tạo 10 hoạt động qua API
# Chạy: .\create-10-activities-api.ps1

$BASE_URL = "http://localhost:3000/activities"
$CREATOR_ID = "550e8400-e29b-41d4-a716-446655440001"

Write-Host "🌱 Bắt đầu tạo 10 hoạt động..." -ForegroundColor Cyan
Write-Host ""

# Array chứa 10 activities
$activities = @(
    @{
        title = "Đá bóng"
        description = "Giải đá bóng nam với các trận đấu thử thách kỹ năng. Mở cửa cho tất cả sinh viên yêu thích bóng đá."
        posterUrl = "/1.jpg"
        location = "Sân bóng đá trường Đại học Cần Thơ"
        categoryId = 1
        unitId = 1
        maxParticipants = 100
        startTime = "2026-05-15T10:00:00Z"
        endTime = "2026-05-15T12:00:00Z"
        tags = @(1, 2)
    },
    @{
        title = "Xuân san sẻ"
        description = "Chương trình xuân sang - chia sẻ yêu thương, trao quà cho cộng đồng địa phương."
        posterUrl = "/2.jpg"
        location = "Sân trường Đại học Cần Thơ"
        categoryId = 3
        unitId = 2
        maxParticipants = 150
        startTime = "2026-02-10T14:00:00Z"
        endTime = "2026-02-10T16:30:00Z"
        tags = @(3, 4)
    },
    @{
        title = "Hội trại"
        description = "Hoạt động hội trại sinh viên với các trò chơi, ca hát, cắm trại đêm."
        posterUrl = "/3.jpg"
        location = "Khu cảnh công viên ngoài trường"
        categoryId = 2
        unitId = 1
        maxParticipants = 200
        startTime = "2026-04-20T08:00:00Z"
        endTime = "2026-04-20T22:00:00Z"
        tags = @(2, 5)
    },
    @{
        title = "Hoa điểm tốt"
        description = "Chương trình trang trí hoa để vinh danh những sinh viên xuất sắc trong học tập."
        posterUrl = "/4.jpg"
        location = "Nhà C Đại học Cần Thơ"
        categoryId = 4
        unitId = 3
        maxParticipants = 80
        startTime = "2026-06-01T09:00:00Z"
        endTime = "2026-06-01T11:00:00Z"
        tags = @(6, 7)
    },
    @{
        title = "Đại hội"
        description = "Đại hội sinh viên toàn trường - bầu chọn đại diện sinh viên, thảo luận các chính sách."
        posterUrl = "/5.jpg"
        location = "Hội trường tổ chức Đại học Cần Thơ"
        categoryId = 5
        unitId = 1
        maxParticipants = 500
        startTime = "2026-03-15T13:00:00Z"
        endTime = "2026-03-15T17:00:00Z"
        tags = @(8, 5)
    },
    @{
        title = "Trung thu"
        description = "Lễ hội Trung Thu với các hoạt động truyền thống, ăn bánh, chơi đèn lồng."
        posterUrl = "/6.jpg"
        location = "Công viên Sinh viên Cần Thơ"
        categoryId = 2
        unitId = 2
        maxParticipants = 300
        startTime = "2026-09-20T18:00:00Z"
        endTime = "2026-09-20T21:00:00Z"
        tags = @(9, 10)
    },
    @{
        title = "Chạy bộ"
        description = "Sự kiện Marathon tập thế - chạy bộ 5km, 10km để nâng cao sức khỏe sinh viên."
        posterUrl = "/7.jpg"
        location = "Khu vực công viên trường"
        categoryId = 1
        unitId = 1
        maxParticipants = 250
        startTime = "2026-07-10T06:00:00Z"
        endTime = "2026-07-10T08:00:00Z"
        tags = @(1, 11)
    },
    @{
        title = "Đá bóng khu nhà C"
        description = "Giải bóng đá nội bộ khu nhà C - sân chơi thân thiện cho sinh viên."
        posterUrl = "/8.jpg"
        location = "Sân bóng trước khu nhà C"
        categoryId = 1
        unitId = 3
        maxParticipants = 60
        startTime = "2026-05-22T16:00:00Z"
        endTime = "2026-05-22T18:00:00Z"
        tags = @(1, 2)
    },
    @{
        title = "Chương trình tình nguyện"
        description = "Hoạt động tình nguyện giúp đỡ cộng đồng - dạy học, vệ sinh môi trường, tặng quà."
        posterUrl = "/9.jpg"
        location = "Làng ngoài thành phố"
        categoryId = 3
        unitId = 2
        maxParticipants = 120
        startTime = "2026-08-05T07:00:00Z"
        endTime = "2026-08-05T12:00:00Z"
        tags = @(3, 4, 12)
    },
    @{
        title = "Vẽ nên những ước mơ"
        description = "Cuộc thi vẽ tranh - sinh viên thể hiện sáng tạo, những ước mơ qua hình ảnh."
        posterUrl = "/10.jpg"
        location = "Phòng triển lãm Đại học Cần Thơ"
        categoryId = 4
        unitId = 1
        maxParticipants = 80
        startTime = "2026-10-12T08:30:00Z"
        endTime = "2026-10-12T11:30:00Z"
        tags = @(13, 6)
    }
)

# Tạo từng activity
$successCount = 0
for ($i = 0; $i -lt $activities.Count; $i++) {
    $activity = $activities[$i]
    $index = $i + 1
    Write-Host "[$index/10] Tạo: $($activity.title)" -ForegroundColor Blue
    
    try {
        $json = $activity | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $BASE_URL -Method Post -ContentType "application/json" -Body $json
        
        if ($response.activity) {
            Write-Host "✅ ID: $($response.activity.id)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "⚠️ Lỗi: $($response.message)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Lỗi: $($_)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Hoàn thành! $successCount/10 hoạt động đã được tạo." -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
