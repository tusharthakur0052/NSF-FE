Implement a production-ready ACL (Access Control List) system in the existing NS-FITNESS application.

IMPORTANT:
- First inspect the existing backend and frontend architecture, database structure, authentication flow, migrations, API patterns, and module structure.
- Follow the existing project conventions wherever possible.
- Do not unnecessarily rewrite or restructure existing modules.
- Do not break any existing functionality.
- Reuse existing authentication/JWT/user patterns if already implemented.
- Keep the implementation scalable but avoid over-engineering.

==================================================
1. ACL / ROLE SYSTEM
==================================================

Create a Role system to support staff access control.

Initially there will be only two system roles:

1. admin
2. manager

Create a `roles` table using the project's existing migration system.

Suggested structure:

roles
-----
id
name
description
permissions
is_system_role
created_at
updated_at

Role requirements:

- `admin`
  - Full system access.
  - Should bypass normal permission restrictions.
  - Mark as system role.

- `manager`
  - Restricted access based on the permissions assigned to the role/staff.
  - Mark as system role.

Use seed migrations / seed data to create the initial roles.

The implementation must be idempotent where appropriate so that running migrations/seeds multiple times does not create duplicate roles.

Use the existing database technology and migration conventions in the project.

==================================================
2. STAFF TABLE
==================================================

Create a new `staff` table for managing staff accounts, specifically managers initially.

The Staff entity should contain profile information and permissions.

Suggested structure:

staff
-----
id
role_id
first_name
last_name
email
phone
password
profile_image
permissions
status
created_at
updated_at

Requirements:

- `role_id` should reference the `roles` table.
- `permissions` should be stored as JSON/JSONB depending on the existing database.
- `status` should support at least:
  - active
  - inactive
- Email should be unique.
- Password must NEVER be stored as plain text.
- Use the existing password hashing mechanism (bcrypt or whatever is already used by the application).
- Follow the existing timestamp and soft-delete conventions if they already exist.

Do not create unnecessary duplicate authentication tables if an existing authentication architecture can be reused.

==================================================
3. PERMISSIONS DESIGN
==================================================

Implement permission-based ACL instead of checking only the role name.

Permissions should follow a consistent format:

resource.action

Examples:

dashboard.view

members.view
members.create
members.update
members.delete

attendance.view
attendance.create
attendance.update
attendance.delete

plans.view
plans.create
plans.update
plans.delete

payments.view
payments.create
payments.update
payments.delete

reports.view
reports.export

staff.view
staff.create
staff.update
staff.delete

settings.view
settings.update

Create a centralized permission constants/configuration so permissions are not hardcoded throughout the application.

Example:

PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",

  MEMBERS_VIEW: "members.view",
  MEMBERS_CREATE: "members.create",
  MEMBERS_UPDATE: "members.update",
  MEMBERS_DELETE: "members.delete",

  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_CREATE: "attendance.create",
  ATTENDANCE_UPDATE: "attendance.update",
  ATTENDANCE_DELETE: "attendance.delete",

  PLANS_VIEW: "plans.view",
  PLANS_CREATE: "plans.create",
  PLANS_UPDATE: "plans.update",
  PLANS_DELETE: "plans.delete",

  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_CREATE: "payments.create",
  PAYMENTS_UPDATE: "payments.update",
  PAYMENTS_DELETE: "payments.delete",

  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",

  STAFF_VIEW: "staff.view",
  STAFF_CREATE: "staff.create",
  STAFF_UPDATE: "staff.update",
  STAFF_DELETE: "staff.delete",

  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update"
}

Keep this centralized and reusable by both backend and frontend where appropriate.

==================================================
4. STAFF PERMISSIONS
==================================================

The Staff record should contain a JSON permissions field.

Example:

{
  "dashboard": {
    "view": true
  },
  "members": {
    "view": true,
    "create": true,
    "update": true,
    "delete": false
  },
  "attendance": {
    "view": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "plans": {
    "view": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "reports": {
    "view": true,
    "export": false
  }
}

The exact JSON structure can follow the existing project conventions, but it must be consistent and easy to consume from both backend and frontend.

Important:

- Admin should have complete access regardless of individual permissions.
- Manager access must be controlled by permissions.
- Do not trust permissions sent from the frontend for authorization.
- Backend must always validate permissions from the authenticated staff/user context.

==================================================
5. BACKEND AUTHORIZATION
==================================================

Implement reusable authorization middleware/guard.

The flow should be:

Request
  ↓
Authentication
  ↓
Identify staff/user
  ↓
Identify role
  ↓
Resolve permissions
  ↓
Check required permission
  ↓
Allow / 403 Forbidden

Create something similar to:

authorize("members.create")
authorize("members.update")
authorize("members.delete")

Example:

router.post(
  "/members",
  authenticate,
  authorize("members.create"),
  createMember
);

For admin:

- Admin should automatically pass authorization checks.

For manager:

- Check the manager's assigned permissions.
- Return HTTP 403 if the required permission is missing.

Keep authentication and authorization separate.

==================================================
6. STAFF CRUD APIs
==================================================

Create a Staff/Manager management module.

Required APIs:

GET    /staff
GET    /staff/:id
POST   /staff
PUT    /staff/:id
DELETE /staff/:id

Additional useful API if required by the existing architecture:

PATCH /staff/:id/status

POST /staff/:id/reset-password

The APIs should support:

- Create manager
- View manager list
- View manager details
- Update manager profile
- Update manager permissions
- Activate/deactivate manager
- Delete manager

Only authorized users should be able to access these APIs.

Initially, only admin should have staff-management permissions.

Managers should NOT be able to create/update/delete other staff unless explicitly granted those permissions in the future.

==================================================
7. STAFF CREATION
==================================================

When creating a manager:

Request example:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "********",
  "roleId": "<manager-role-id>",
  "permissions": {
    "dashboard": {
      "view": true
    },
    "members": {
      "view": true,
      "create": true,
      "update": true,
      "delete": false
    }
  }
}

Validate:

- Required fields
- Valid email
- Unique email
- Valid role
- Valid permissions
- Password rules
- Valid status

Do not allow arbitrary/unknown permissions to be stored.

==================================================
8. LOGIN / AUTHENTICATION INTEGRATION
==================================================

Integrate Staff with the existing authentication system.

Inspect the existing login/JWT implementation before making changes.

After login, the authenticated user/staff context should provide enough information for authorization.

Prefer something similar to:

{
  "id": "...",
  "role": "manager",
  "permissions": [...]
}

or an equivalent structure compatible with the existing authentication architecture.

Do not blindly put a large permission object into a long-lived JWT if the existing architecture does not require it.

The backend remains the source of truth for authorization.

Also make sure that when a manager's permissions are changed, the updated permissions are reflected in subsequent requests/session refreshes.

==================================================
9. FRONTEND ACL INTEGRATION
==================================================

Integrate the ACL system into the existing React frontend.

Follow the existing feature/module architecture.

Suggested structure:

src/
  modules/
    staff/
      api/
      hooks/
      pages/
      components/
      types/

  shared/
    hooks/
      usePermission.ts

    components/
      ProtectedRoute/
      Can/

    constants/
      permissions.ts

Do not create a completely separate architecture if the existing project already has equivalent structures.

==================================================
10. FRONTEND PERMISSION HOOK
==================================================

Create a reusable permission hook.

Example:

const { hasPermission, isAdmin } = usePermission();

Usage:

hasPermission("members.view")
hasPermission("members.create")
hasPermission("members.update")
hasPermission("members.delete")

Admin should automatically return true for all permissions.

Example:

const canDelete = hasPermission("members.delete");

==================================================
11. ROUTE PROTECTION
==================================================

Protect frontend routes based on permissions.

Example:

/members
  -> members.view

/members/create
  -> members.create

/members/:id/edit
  -> members.update

/staff
  -> staff.view

/staff/create
  -> staff.create

If the user does not have permission:

- Do not render the page.
- Show the existing application's unauthorized/403 page if available.
- Otherwise create a simple reusable Unauthorized component.

IMPORTANT:

Frontend route protection is only for UX.

Backend authorization must still protect every API.

==================================================
12. SIDEBAR / NAVIGATION ACL
==================================================

Update the frontend sidebar/navigation.

Each menu item should define its required permission.

Example:

{
  label: "Members",
  path: "/members",
  permission: "members.view"
}

Then dynamically display only items for which the current user has permission.

For admin:

- Show all available menu items.

For manager:

- Show only permitted modules.

Do not duplicate permission conditions manually throughout the sidebar.

==================================================
13. ACTION-LEVEL ACL
==================================================

Also implement permission checks at button/action level.

Example:

<Can permission="members.create">
  <Button>Create Member</Button>
</Can>

<Can permission="members.delete">
  <Button>Delete</Button>
</Can>

Create a reusable `Can` component.

It should support:

- Single permission
- Optional fallback
- Admin bypass

Example:

<Can
  permission="members.delete"
  fallback={null}
>
  <DeleteButton />
</Can>

==================================================
14. STAFF MANAGEMENT UI
==================================================

Create the Staff/Manager management screens.

Required screens:

1. Staff/Managers List
   - Name
   - Email
   - Phone
   - Role
   - Status
   - Actions

2. Create Manager
   - First name
   - Last name
   - Email
   - Phone
   - Password
   - Permissions

3. Edit Manager
   - Profile information
   - Status
   - Permissions

4. Manager Details
   - Profile
   - Role
   - Permissions
   - Status

5. Permission Management UI

Create a clean permission matrix.

Example:

                View    Create    Update    Delete
Members          ✓        ✓         ✓         ✗
Attendance       ✓        ✗         ✗         ✗
Plans            ✓        ✗         ✗         ✗
Payments         ✓        ✓         ✗         ✗
Reports          ✓        ✗         ✗         ✗

Use checkboxes/toggles for permissions.

Group permissions by module/resource.

Make the UI easy for an admin to understand.

==================================================
15. FRONTEND API / HOOKS
==================================================

Follow the existing frontend API architecture.

If RTK Query is already configured:

- Create a Staff API using the existing base API.
- Use `api.injectEndpoints`.
- Generate query/mutation hooks.
- Create custom hooks only where they improve business logic.

Expected operations:

useGetStaffQuery
useGetStaffByIdQuery
useCreateStaffMutation
useUpdateStaffMutation
useDeleteStaffMutation
useUpdateStaffStatusMutation

Do not create unnecessary duplicate API clients.

==================================================
16. TYPESCRIPT TYPES
==================================================

Create strongly typed interfaces/types for:

Role
Staff
Permission
StaffPermissions
CreateStaffRequest
UpdateStaffRequest
StaffListResponse
StaffDetailsResponse

Avoid `any`.

Keep permission types centralized.

==================================================
17. VALIDATION & ERROR HANDLING
==================================================

Backend:

- Validate request payloads.
- Validate role IDs.
- Validate permissions.
- Handle duplicate email.
- Handle missing staff.
- Handle invalid role.
- Return appropriate HTTP status codes.
- Follow existing API response/error format.

Frontend:

- Show API validation errors properly.
- Handle loading states.
- Handle empty states.
- Handle unauthorized/forbidden states.
- Disable submit buttons during mutations.
- Show success/error notifications using the existing notification system.

==================================================
18. SECURITY REQUIREMENTS
==================================================

Important security requirements:

- Never store plain-text passwords.
- Never trust frontend permissions.
- Never authorize only from frontend route checks.
- Backend must enforce every protected action.
- Admin bypass must happen server-side.
- Managers cannot elevate their own permissions.
- Managers cannot change their own role to admin.
- Managers cannot create an admin account.
- Prevent unauthorized modification of role/system-role configuration.
- Validate all incoming permissions against the centralized permission list.
- Follow existing authentication/JWT security patterns.

==================================================
19. DATABASE / MIGRATIONS
==================================================

Before implementing migrations:

- Inspect existing migration naming conventions.
- Inspect existing foreign-key conventions.
- Inspect existing UUID/auto-increment strategy.
- Inspect timestamp conventions.
- Inspect soft-delete conventions.
- Inspect JSON/JSONB usage.

Then create:

1. Roles migration
2. Staff migration
3. Role seed migration / seed data

Seed:

ADMIN
MANAGER

Ensure migrations work cleanly from a fresh database.

==================================================
20. EXISTING SYSTEM INTEGRATION
==================================================

Before coding, inspect:

- Existing authentication module
- Existing user/admin model
- Existing database schema
- Existing migration system
- Existing frontend auth state
- Existing route configuration
- Existing sidebar
- Existing API layer
- Existing module architecture
- Existing form/validation components
- Existing notification system

Reuse existing patterns.

Do not introduce a second authentication system unless absolutely necessary.

If an existing User/Admin table already exists, determine whether Staff should integrate with it or whether authentication should be migrated carefully.

Do not blindly create duplicate user/account functionality.

==================================================
21. DELIVERABLE
==================================================

Implement the complete feature end-to-end:

Backend:
- Role model/table
- Staff model/table
- Role seed migration
- Staff CRUD
- Permission constants
- Permission validation
- Authentication integration
- Authorization middleware/guard
- Protected APIs
- DTO/request validation
- Error handling

Frontend:
- Staff module
- Staff list
- Create manager
- Edit manager
- Manager details
- Permission matrix
- Permission hook
- Can component
- Protected routes
- Sidebar ACL
- Action-level ACL
- API integration
- TypeScript types
- Loading/error/empty states

==================================================
22. IMPORTANT IMPLEMENTATION APPROACH
==================================================

Do NOT start coding immediately.

First:

1. Analyze the existing backend architecture.
2. Analyze the existing frontend architecture.
3. Identify existing authentication implementation.
4. Identify existing database/migration patterns.
5. Identify existing admin/user model.
6. Identify where ACL should integrate.
7. Provide a concise implementation plan.
8. Then implement the changes.

After implementation:

- Run migrations.
- Run seeds.
- Run backend tests/type checks/build.
- Run frontend tests/type checks/build.
- Fix TypeScript/lint/build errors.
- Verify existing functionality has not been broken.
- Verify admin can access everything.
- Verify manager can access only assigned permissions.
- Verify unauthorized API requests return 403.
- Verify unauthorized frontend routes are blocked.
- Verify sidebar hides inaccessible modules.
- Verify action buttons respect permissions.

Do not leave TODOs or placeholder implementations for core ACL functionality.

Keep the implementation clean, modular, scalable, and production-ready.