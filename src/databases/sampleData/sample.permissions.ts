export const INIT_PERMISSIONS = [
  // Activity permissions
  {
    id: 1,
    slug: 'activity.create',
    resource: 'activity',
    action: 'create',
    description: 'Tạo hoạt động mới',
  },
  {
    id: 2,
    slug: 'activity.read',
    resource: 'activity',
    action: 'read',
    description: 'Xem chi tiết hoạt động',
  },
  {
    id: 3,
    slug: 'activity.update',
    resource: 'activity',
    action: 'update',
    description: 'Chỉnh sửa hoạt động',
  },
  {
    id: 4,
    slug: 'activity.delete',
    resource: 'activity',
    action: 'delete',
    description: 'Xóa hoạt động',
  },
  {
    id: 5,
    slug: 'activity.approve',
    resource: 'activity',
    action: 'approve',
    description: 'Duyệt hoạt động',
  },

  // User permissions
  {
    id: 6,
    slug: 'user.create',
    resource: 'user',
    action: 'create',
    description: 'Tạo người dùng mới',
  },
  {
    id: 7,
    slug: 'user.read',
    resource: 'user',
    action: 'read',
    description: 'Xem thông tin người dùng',
  },
  {
    id: 8,
    slug: 'user.update',
    resource: 'user',
    action: 'update',
    description: 'Chỉnh sửa người dùng',
  },
  {
    id: 9,
    slug: 'user.delete',
    resource: 'user',
    action: 'delete',
    description: 'Xóa người dùng',
  },

  // Unit permissions
  {
    id: 10,
    slug: 'unit.create',
    resource: 'unit',
    action: 'create',
    description: 'Tạo đơn vị',
  },
  {
    id: 11,
    slug: 'unit.read',
    resource: 'unit',
    action: 'read',
    description: 'Xem đơn vị',
  },
  {
    id: 12,
    slug: 'unit.update',
    resource: 'unit',
    action: 'update',
    description: 'Chỉnh sửa đơn vị',
  },
  {
    id: 13,
    slug: 'unit.delete',
    resource: 'unit',
    action: 'delete',
    description: 'Xóa đơn vị',
  },

  // Role permissions
  {
    id: 14,
    slug: 'role.create',
    resource: 'role',
    action: 'create',
    description: 'Tạo vai trò',
  },
  {
    id: 15,
    slug: 'role.read',
    resource: 'role',
    action: 'read',
    description: 'Xem vai trò',
  },
  {
    id: 16,
    slug: 'role.update',
    resource: 'role',
    action: 'update',
    description: 'Chỉnh sửa vai trò',
  },
  {
    id: 17,
    slug: 'role.delete',
    resource: 'role',
    action: 'delete',
    description: 'Xóa vai trò',
  },

  // Registration permissions
  {
    id: 18,
    slug: 'registration.create',
    resource: 'registration',
    action: 'create',
    description: 'Đăng ký hoạt động',
  },
  {
    id: 19,
    slug: 'registration.read',
    resource: 'registration',
    action: 'read',
    description: 'Xem đăng ký hoạt động',
  },
  {
    id: 20,
    slug: 'registration.update',
    resource: 'registration',
    action: 'update',
    description: 'Chỉnh sửa đăng ký hoạt động',
  },
  {
    id: 21,
    slug: 'registration.delete',
    resource: 'registration',
    action: 'delete',
    description: 'Xóa đăng ký hoạt động',
  },

  // Report permissions
  {
    id: 22,
    slug: 'report.read',
    resource: 'report',
    action: 'read',
    description: 'Xem báo cáo',
  },
  {
    id: 23,
    slug: 'report.export',
    resource: 'report',
    action: 'export',
    description: 'Xuất báo cáo',
  },

  // Criteria permissions
  {
    id: 24,
    slug: 'criteria.create',
    resource: 'criteria',
    action: 'create',
    description: 'Tạo tiêu chí',
  },
  {
    id: 25,
    slug: 'criteria.read',
    resource: 'criteria',
    action: 'read',
    description: 'Xem tiêu chí',
  },
  {
    id: 26,
    slug: 'criteria.update',
    resource: 'criteria',
    action: 'update',
    description: 'Chỉnh sửa tiêu chí',
  },

  // Tag permissions
  {
    id: 27,
    slug: 'tag.create',
    resource: 'tag',
    action: 'create',
    description: 'Tạo nhãn',
  },
  {
    id: 28,
    slug: 'tag.read',
    resource: 'tag',
    action: 'read',
    description: 'Xem nhãn',
  },
];
