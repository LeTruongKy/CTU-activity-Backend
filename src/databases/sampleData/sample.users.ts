// NOTE: Password hashing will be done by DatabasesService during initialization
// All users will be created with default password from INIT_PASSWORD env variable
export const INIT_USERS = [
  // Admin user
  {
    id: '550e8400-e29b-41d4-a716-556655440001',
    studentCode: 'ADMIN001',
    email: 'admin@ctuactivity.edu.vn',
    fullName: 'Admin CTU Activity',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440001', // LCH
  },
  // LCH user
  {
    id: '550e8400-e29b-41d4-a716-556655440002',
    studentCode: 'LCHSVCT001',
    email: 'LCHSVCT@gmail.com',
    fullName: 'Liên Chi Hội Sinh Viên Cần Thơ',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440001', // LCH
  },
  // CH users
  {
    id: '550e8400-e29b-41d4-a716-556655440003',
    studentCode: 'CH_TAN_HOA_001',
    email: 'CHSV_TAN_HOA@gmail.com',
    fullName: 'Chi hội Tân Hoà',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440002',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440004',
    studentCode: 'CH_BINH_THUY_001',
    email: 'CHSV_BINH_THUY@gmail.com',
    fullName: 'Chi hội Bình Thuỷ',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440003',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440005',
    studentCode: 'CH_CAI_RANG_001',
    email: 'CHSV_CAI_RANG@gmail.com',
    fullName: 'Chi hội Cái Răng',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440004',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440006',
    studentCode: 'CH_KE_SACH_001',
    email: 'CHSV_KE_SACH@gmail.com',
    fullName: 'Chi hội Kế Sách',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440005',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440007',
    studentCode: 'CH_MY_XUYEN_001',
    email: 'CHSV_MY_XUYEN_TRAN_DE@gmail.com',
    fullName: 'Chi hội Mỹ Xuyên - Trần Đề',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440006',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440008',
    studentCode: 'CH_CHAU_THANH_001',
    email: 'CHSV_CHAU_THANH@gmail.com',
    fullName: 'Chi hội Châu Thành',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440007',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440009',
    studentCode: 'CH_NGA_BAY_001',
    email: 'CHSV_NGA_BAY@gmail.com',
    fullName: 'Chi hội Ngã Bảy',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440008',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440010',
    studentCode: 'CH_VINH_CHAU_001',
    email: 'CHSV_VINH_CHAU@gmail.com',
    fullName: 'Chi hội Vĩnh Châu',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440009',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440011',
    studentCode: 'CH_PHONG_DIEN_001',
    email: 'CHSV_PHONG_DIEN@gmail.com',
    fullName: 'Chi hội Phong Điền',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440010',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440012',
    studentCode: 'CH_PHU_LOC_001',
    email: 'CHSV_PHU_LOC@gmail.com',
    fullName: 'Chi hội Phú Lộc',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440011',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440013',
    studentCode: 'CH_NINH_KIEU_001',
    email: 'CHSV_NINH_KIEU@gmail.com',
    fullName: 'Chi hội Ninh Kiều',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440012',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440014',
    studentCode: 'CH_CO_DO_001',
    email: 'CHSV_CO_DO@gmail.com',
    fullName: 'Chi hội Cờ Đỏ',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440013',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440015',
    studentCode: 'CH_MY_TU_001',
    email: 'CHSV_MY_TU@gmail.com',
    fullName: 'Chi hội Mỹ Tú',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440014',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440016',
    studentCode: 'CH_THOI_LAI_001',
    email: 'CHSV_THOI_LAI@gmail.com',
    fullName: 'Chi hội Thới Lai',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440015',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440017',
    studentCode: 'CH_LONG_MY_001',
    email: 'CHSV_LONG_MY@gmail.com',
    fullName: 'Chi hội Long Mỹ',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440016',
  },

  // Sample students
  {
    id: '550e8400-e29b-41d4-a716-556655440018',
    studentCode: 'SV001',
    email: 'student1@ctuactivity.edu.vn',
    fullName: 'Nguyễn Văn A',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440002',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440019',
    studentCode: 'SV002',
    email: 'student2@ctuactivity.edu.vn',
    fullName: 'Trần Thị B',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440003',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440020',
    studentCode: 'SV003',
    email: 'student3@ctuactivity.edu.vn',
    fullName: 'Lê Văn C',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440004',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440021',
    studentCode: 'SV004',
    email: 'student4@ctuactivity.edu.vn',
    fullName: 'Phạm Thị D',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440005',
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440022',
    studentCode: 'SV005',
    email: 'student5@ctuactivity.edu.vn',
    fullName: 'Đặng Văn E',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE',
    unitId: '550e8400-e29b-41d4-a716-446655440006',
  },
];
