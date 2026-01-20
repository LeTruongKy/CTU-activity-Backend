export const INIT_ROLE_PERMISSIONS = [
  // ADMIN has all permissions
  { roleId: 1, permissionId: 1 },
  { roleId: 1, permissionId: 2 },
  { roleId: 1, permissionId: 3 },
  { roleId: 1, permissionId: 4 },
  { roleId: 1, permissionId: 5 },
  { roleId: 1, permissionId: 6 },
  { roleId: 1, permissionId: 7 },
  { roleId: 1, permissionId: 8 },
  { roleId: 1, permissionId: 9 },
  { roleId: 1, permissionId: 10 },
  { roleId: 1, permissionId: 11 },
  { roleId: 1, permissionId: 12 },
  { roleId: 1, permissionId: 13 },
  { roleId: 1, permissionId: 14 },
  { roleId: 1, permissionId: 15 },
  { roleId: 1, permissionId: 16 },
  { roleId: 1, permissionId: 17 },
  { roleId: 1, permissionId: 18 },
  { roleId: 1, permissionId: 19 },
  { roleId: 1, permissionId: 20 },
  { roleId: 1, permissionId: 21 },
  { roleId: 1, permissionId: 22 },
  { roleId: 1, permissionId: 23 },
  { roleId: 1, permissionId: 24 },
  { roleId: 1, permissionId: 25 },
  { roleId: 1, permissionId: 26 },
  { roleId: 1, permissionId: 27 },
  { roleId: 1, permissionId: 28 },

  // LCH - Liên Chi Hội
  { roleId: 2, permissionId: 1 }, // activity.create
  { roleId: 2, permissionId: 2 }, // activity.read
  { roleId: 2, permissionId: 3 }, // activity.update
  { roleId: 2, permissionId: 5 }, // activity.approve
  { roleId: 2, permissionId: 7 }, // user.read
  { roleId: 2, permissionId: 11 }, // unit.read
  { roleId: 2, permissionId: 15 }, // role.read
  { roleId: 2, permissionId: 19 }, // registration.read
  { roleId: 2, permissionId: 22 }, // report.read
  { roleId: 2, permissionId: 23 }, // report.export
  { roleId: 2, permissionId: 25 }, // criteria.read

  // CH - Chi Hội
  { roleId: 3, permissionId: 1 }, // activity.create
  { roleId: 3, permissionId: 2 }, // activity.read
  { roleId: 3, permissionId: 3 }, // activity.update
  { roleId: 3, permissionId: 7 }, // user.read
  { roleId: 3, permissionId: 11 }, // unit.read
  { roleId: 3, permissionId: 18 }, // registration.create
  { roleId: 3, permissionId: 19 }, // registration.read
  { roleId: 3, permissionId: 22 }, // report.read
  { roleId: 3, permissionId: 25 }, // criteria.read

  // STUDENT
  { roleId: 4, permissionId: 2 }, // activity.read
  { roleId: 4, permissionId: 7 }, // user.read (own profile)
  { roleId: 4, permissionId: 11 }, // unit.read
  { roleId: 4, permissionId: 18 }, // registration.create
  { roleId: 4, permissionId: 19 }, // registration.read
  { roleId: 4, permissionId: 25 }, // criteria.read
  { roleId: 4, permissionId: 28 }, // tag.read
];
