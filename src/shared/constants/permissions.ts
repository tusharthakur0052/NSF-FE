export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  MEMBERS_VIEW: 'members.view',
  MEMBERS_CREATE: 'members.create',
  MEMBERS_UPDATE: 'members.update',
  MEMBERS_DELETE: 'members.delete',

  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_CREATE: 'attendance.create',
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_DELETE: 'attendance.delete',

  PLANS_VIEW: 'plans.view',
  PLANS_CREATE: 'plans.create',
  PLANS_UPDATE: 'plans.update',
  PLANS_DELETE: 'plans.delete',

  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_UPDATE: 'payments.update',
  PAYMENTS_DELETE: 'payments.delete',

  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

export interface ModulePermissionConfig {
  id: string;
  name: string;
  description: string;
  actions: {
    key: string;
    label: string;
    permission: string;
  }[];
}

export const PERMISSION_MODULES: ModulePermissionConfig[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Overview statistics and analytics',
    actions: [
      { key: 'view', label: 'View Dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
    ],
  },
  {
    id: 'members',
    name: 'Members',
    description: 'Member management and registrations',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.MEMBERS_VIEW },
      { key: 'create', label: 'Create', permission: PERMISSIONS.MEMBERS_CREATE },
      { key: 'update', label: 'Update', permission: PERMISSIONS.MEMBERS_UPDATE },
      { key: 'delete', label: 'Delete', permission: PERMISSIONS.MEMBERS_DELETE },
    ],
  },
  {
    id: 'attendance',
    name: 'Attendance & Entries',
    description: 'Gym entry logs and attendance checking',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.ATTENDANCE_VIEW },
      { key: 'create', label: 'Create', permission: PERMISSIONS.ATTENDANCE_CREATE },
      { key: 'update', label: 'Update', permission: PERMISSIONS.ATTENDANCE_UPDATE },
      { key: 'delete', label: 'Delete', permission: PERMISSIONS.ATTENDANCE_DELETE },
    ],
  },
  {
    id: 'plans',
    name: 'Subscription Plans',
    description: 'Membership plans and packages',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.PLANS_VIEW },
      { key: 'create', label: 'Create', permission: PERMISSIONS.PLANS_CREATE },
      { key: 'update', label: 'Update', permission: PERMISSIONS.PLANS_UPDATE },
      { key: 'delete', label: 'Delete', permission: PERMISSIONS.PLANS_DELETE },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Expenses',
    description: 'Expense tracking and payment records',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.PAYMENTS_VIEW },
      { key: 'create', label: 'Create', permission: PERMISSIONS.PAYMENTS_CREATE },
      { key: 'update', label: 'Update', permission: PERMISSIONS.PAYMENTS_UPDATE },
      { key: 'delete', label: 'Delete', permission: PERMISSIONS.PAYMENTS_DELETE },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Export',
    description: 'Data reports and Excel export capabilities',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.REPORTS_VIEW },
      { key: 'export', label: 'Export', permission: PERMISSIONS.REPORTS_EXPORT },
    ],
  },
  {
    id: 'staff',
    name: 'Staff & Roles',
    description: 'Manager accounts and role permissions',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.STAFF_VIEW },
      { key: 'create', label: 'Create', permission: PERMISSIONS.STAFF_CREATE },
      { key: 'update', label: 'Update', permission: PERMISSIONS.STAFF_UPDATE },
      { key: 'delete', label: 'Delete', permission: PERMISSIONS.STAFF_DELETE },
    ],
  },
  {
    id: 'settings',
    name: 'Settings & System',
    description: 'Global system configuration',
    actions: [
      { key: 'view', label: 'View', permission: PERMISSIONS.SETTINGS_VIEW },
      { key: 'update', label: 'Update', permission: PERMISSIONS.SETTINGS_UPDATE },
    ],
  },
];
