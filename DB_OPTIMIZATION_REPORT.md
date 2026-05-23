# Database Optimization Report

## Problems Found

1. Employee list loaded every row at once.
   `/api/users` returned the full employee table for a tenant. This becomes slow as employee count grows and also makes the frontend hold unnecessary data.

2. N+1 style counting in organization dashboards.
   `AdminService` and `SuperAdminService` loaded all users for each tenant and counted active users in Java. With many organizations this becomes one query for admins plus one user-list query per tenant.

3. Leave admin list had N+1 user lookups.
   `LeaveService.getAllLeaves()` fetched leave rows, then fetched each employee one-by-one by ID.

4. Attendance trend queries repeated work inside loops.
   Monthly attendance trends counted total employees inside every day loop. Seven-day trends ran one attendance count query per day.

5. Frequently queried columns had no explicit indexes in the JPA model.
   Auth token, tenant, date, status, role, and user/date lookups are common query filters and should be indexed.

6. Auth validation still performs multiple token lookups per request.
   `AuthInterceptor` checks super admin, admin, then employee token tables. Indexes reduce the cost, but a unified session/token table would be cleaner at larger scale.

## Changes Made

1. Added employee pagination.
   `/api/users` now accepts `page`, `size`, `search`, and `department`.
   Default page size is 20 and max page size is capped at 100.

2. Updated frontend employee loading.
   The employee table now requests 20 employees at a time and uses backend pagination metadata for Previous/Next.

3. Replaced list-and-count patterns.
   Active employee counts now use count/group queries instead of loading full employee lists into Java.

4. Removed leave N+1 lookup.
   Leave admin data now batch-loads employees with `findByIdIn(...)`.

5. Reduced attendance trend query count.
   Monthly trend total employee count is computed once.
   Seven-day trend attendance counts are loaded in one date-range query and grouped in memory.

6. Added JPA index metadata.
   Indexes were added for common access patterns on Employee, Admin, SuperAdmin, attendance_details, leave_requests, clock_out_requests, and notices.

7. Removed remaining bulk-import N+1 behavior.
   Bulk employee import previously checked each email with one DB query and called `createUser()` per employee, which reloaded tenant/admin data repeatedly. It now does one existing-email lookup, one max employee-code lookup, prepares users in memory, and saves them with `saveAll(...)`.

8. Replaced tenant token clearing with one update query.
   Organization deactivation no longer loads every employee just to clear auth tokens. It uses a single bulk update query.

9. Enabled Hibernate JDBC batching.
   Inserts and updates are ordered and batched with batch size 50, which improves bulk employee import and other batch writes.

## Second N+1 Review

After the second pass, the main service loops no longer contain repository calls for:

- Employee bulk import
- Admin organization active-user counts
- Super admin dashboard active-user counts
- Leave admin employee enrichment
- Tenant-wide force logout token clearing

Remaining loops in services are in-memory aggregation only, such as grouping attendance and leave data after a bounded query. They are not N+1 database queries.

## Recommended SQL Indexes

If Hibernate `ddl-auto=update` does not create indexes reliably in your environment, apply these manually through a DB migration:

```sql
CREATE INDEX idx_employee_tenant_role_status ON Employee (tenant_id, role, status);
CREATE INDEX idx_employee_tenant_code ON Employee (tenant_id, employee_code);
CREATE INDEX idx_employee_auth_token ON Employee (auth_token);

CREATE INDEX idx_admin_auth_token ON admin (auth_token);
CREATE INDEX idx_admin_status ON admin (status);
CREATE INDEX idx_super_admin_auth_token ON super_admin (auth_token);

CREATE INDEX idx_attendance_tenant_date ON attendance_details (tenant_id, attendance_date);
CREATE INDEX idx_attendance_user_tenant_date ON attendance_details (user_id, tenant_id, attendance_date);
CREATE INDEX idx_attendance_user_tenant_checkout ON attendance_details (user_id, tenant_id, check_out_time);

CREATE INDEX idx_leave_tenant_status ON leave_requests (tenant_id, status);
CREATE INDEX idx_leave_user_tenant_status ON leave_requests (user_id, tenant_id, status);
CREATE INDEX idx_leave_tenant_dates ON leave_requests (tenant_id, from_date, to_date);

CREATE INDEX idx_clockout_tenant_status ON clock_out_requests (tenant_id, status);
CREATE INDEX idx_clockout_user_tenant_date ON clock_out_requests (user_id, tenant_id, attendance_date);

CREATE INDEX idx_notice_tenant_created ON notices (tenant_id, created_at);
```

Column names may need adjustment if your existing schema uses camelCase names because Hibernate naming strategy controls the final physical names.

## Remaining Improvements

1. Add database migrations.
   The project currently relies on `spring.jpa.hibernate.ddl-auto=update`. For production, use Flyway or Liquibase so indexes and schema changes are deterministic.

2. Add server-side department options.
   The employee filter currently builds department options from the current page. A lightweight `/api/users/departments` endpoint would make filtering complete across all employees.

3. Replace token lookups with a session table.
   A single indexed `sessions(token, role, subject_id, tenant_id, revoked_at)` table would avoid three repository checks on every authenticated request.

4. Add pagination to leaves, attendance history, notices, and clock-out requests.
   Employee pagination is done first because it is the largest visible table, but the same pattern should be applied to other growing tables.

5. Store dates as date/time types.
   Several entities store dates as strings. ISO strings work for basic ordering, but `DATE`/`DATETIME` columns are better for indexes, ranges, and reporting.
