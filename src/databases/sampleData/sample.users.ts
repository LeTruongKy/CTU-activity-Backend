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
    status: 'ACTIVE' as const,
    unitId: 1, // LCH
  },
  // LCH user
  {
    id: '550e8400-e29b-41d4-a716-556655440002',
    studentCode: 'LCHSVCT001',
    email: 'LCHSVCT@gmail.com',
    fullName: 'Liên Chi Hội Sinh Viên Cần Thơ',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 1, // LCH
  },
  // CH users
  {
    id: '550e8400-e29b-41d4-a716-556655440003',
    studentCode: 'CH_TAN_HOA_001',
    email: 'CHSV_TAN_HOA@gmail.com',
    fullName: 'Chi hội Tân Hoà',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 2,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440004',
    studentCode: 'CH_BINH_THUY_001',
    email: 'CHSV_BINH_THUY@gmail.com',
    fullName: 'Chi hội Bình Thuỷ',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 3,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440005',
    studentCode: 'CH_CAI_RANG_001',
    email: 'CHSV_CAI_RANG@gmail.com',
    fullName: 'Chi hội Cái Răng',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 4,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440006',
    studentCode: 'CH_KE_SACH_001',
    email: 'CHSV_KE_SACH@gmail.com',
    fullName: 'Chi hội Kế Sách',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 5,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440007',
    studentCode: 'CH_MY_XUYEN_001',
    email: 'CHSV_MY_XUYEN_TRAN_DE@gmail.com',
    fullName: 'Chi hội Mỹ Xuyên - Trần Đề',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 6,
  },

  // Sample students
  {
    id: '550e8400-e29b-41d4-a716-556655440018',
    studentCode: 'SV001',
    email: 'student1@ctuactivity.edu.vn',
    fullName: 'Nguyễn Văn A',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 2,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440019',
    studentCode: 'SV002',
    email: 'student2@ctuactivity.edu.vn',
    fullName: 'Trần Thị B',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 3,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440020',
    studentCode: 'SV003',
    email: 'student3@ctuactivity.edu.vn',
    fullName: 'Lê Văn C',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 4,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440021',
    studentCode: 'SV004',
    email: 'student4@ctuactivity.edu.vn',
    fullName: 'Phạm Thị D',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 5,
  },
  {
    id: '550e8400-e29b-41d4-a716-556655440022',
    studentCode: 'SV005',
    email: 'student5@ctuactivity.edu.vn',
    fullName: 'Đặng Văn E',
    passwordHash: null, // Will be hashed by service
    avatarUrl: null,
    status: 'ACTIVE' as const,
    unitId: 6,
  },
];
