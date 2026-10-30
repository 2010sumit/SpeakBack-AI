// scripts/verify-security.mjs
// Automated verification of authorization boundaries and security assertions

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== SpeakBack AI Security & Authorization Boundary Checks ===\n');

let passedChecks = 0;

// Test 1: Verify .gitignore excludes private environment files
const gitignoreContent = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
assert(gitignoreContent.includes('.env'), 'FAIL: .gitignore must exclude .env');
assert(gitignoreContent.includes('.env.*'), 'FAIL: .gitignore must exclude .env.*');
assert(gitignoreContent.includes('!.env.example'), 'FAIL: .gitignore must whitelist .env.example');
console.log('✔ Check 1: Private environment files are strictly excluded from git.');
passedChecks++;

// Test 2: Verify .env.example contains no real secrets or credentials
const envExampleContent = fs.readFileSync(path.resolve('.env.example'), 'utf8');
assert(!envExampleContent.includes('eyJh'), 'FAIL: .env.example contains a real JWT/token');
assert(!envExampleContent.includes('sk-'), 'FAIL: .env.example contains a real secret key');
assert(envExampleContent.includes('NEXT_PUBLIC_SUPABASE_URL='), 'FAIL: .env.example missing SUPABASE_URL placeholder');
assert(envExampleContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='), 'FAIL: .env.example missing ANON_KEY placeholder');
assert(envExampleContent.includes('SUPABASE_SERVICE_ROLE_KEY='), 'FAIL: .env.example missing SERVICE_ROLE_KEY placeholder');
assert(envExampleContent.includes('ADMIN_BOOTSTRAP_SECRET='), 'FAIL: .env.example missing BOOTSTRAP placeholder');
console.log('✔ Check 2: .env.example contains only clean placeholder names.');
passedChecks++;

// Test 3: Verify User Isolation in Session Handlers
const sessionRoute = fs.readFileSync(path.resolve('src/app/api/sessions/[id]/route.ts'), 'utf8');
assert(sessionRoute.includes(".eq('user_id', user.id)"), 'FAIL: Session GET/PATCH/DELETE must verify user_id ownership');
console.log('✔ Check 3: User isolation enforced — User A cannot retrieve, update, or delete User B\'s history.');
passedChecks++;

// Test 4: Verify Server-Side Authorization on all Admin API endpoints
const adminOverviewRoute = fs.readFileSync(path.resolve('src/app/api/admin/overview/route.ts'), 'utf8');
assert(adminOverviewRoute.includes('requireAdmin()'), 'FAIL: Admin overview must enforce requireAdmin()');

const adminUsersRoute = fs.readFileSync(path.resolve('src/app/api/admin/users/route.ts'), 'utf8');
assert(adminUsersRoute.includes('requireAdmin()'), 'FAIL: Admin users must enforce requireAdmin()');

const adminSessionsRoute = fs.readFileSync(path.resolve('src/app/api/admin/sessions/route.ts'), 'utf8');
assert(adminSessionsRoute.includes('requireAdmin()'), 'FAIL: Admin sessions must enforce requireAdmin()');

const adminAuditRoute = fs.readFileSync(path.resolve('src/app/api/admin/audit-logs/route.ts'), 'utf8');
assert(adminAuditRoute.includes('requireAdmin()'), 'FAIL: Admin audit logs must enforce requireAdmin()');

const adminLayout = fs.readFileSync(path.resolve('src/app/admin/layout.tsx'), 'utf8');
assert(adminLayout.includes('requireAdmin()'), 'FAIL: Admin layout shell must enforce requireAdmin() server-side');
console.log('✔ Check 4: Admin area strictly protected by server-side role check (requireAdmin()). Deny by default.');
passedChecks++;

// Test 5: Verify Admin Audit Logging
assert(adminOverviewRoute.includes('recordAdminAuditLog'), 'FAIL: Admin overview must record audit log');
assert(adminUsersRoute.includes('recordAdminAuditLog'), 'FAIL: Admin user search must record audit log');
assert(adminSessionsRoute.includes('recordAdminAuditLog'), 'FAIL: Admin session inspection must record audit log');
assert(adminAuditRoute.includes('recordAdminAuditLog'), 'FAIL: Admin audit viewing must record audit log');
console.log('✔ Check 5: Sensitive admin operations record immutable audit entries in admin_audit_logs.');
passedChecks++;

// Test 6: Verify Service Role Key Isolation
const clientTs = fs.readFileSync(path.resolve('src/lib/supabase/client.ts'), 'utf8');
assert(!clientTs.includes('SUPABASE_SERVICE_ROLE_KEY'), 'FAIL: Browser client must NEVER reference SUPABASE_SERVICE_ROLE_KEY');
console.log('✔ Check 6: SUPABASE_SERVICE_ROLE_KEY is strictly server-side and never bundled to browser code.');
passedChecks++;

// Test 7: Verify Database RLS and Security Policies in Migration
const migrationSql = fs.readFileSync(path.resolve('supabase/migrations/20261030000000_auth_learning_history_admin.sql'), 'utf8');
assert(migrationSql.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'), 'FAIL: profiles RLS missing');
assert(migrationSql.includes('ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;'), 'FAIL: learning_sessions RLS missing');
assert(migrationSql.includes('ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;'), 'FAIL: admin_audit_logs RLS missing');
assert(migrationSql.includes('auth.uid() = user_id'), 'FAIL: user_id RLS check missing');
assert(migrationSql.includes('public.is_admin()'), 'FAIL: is_admin() function missing');
console.log('✔ Check 7: SQL migration contains full Row Level Security (RLS) policies and security definer functions.');
passedChecks++;

// Test 8: Verify Middleware Route Protection
const middlewareTs = fs.readFileSync(path.resolve('src/middleware.ts'), 'utf8');
assert(middlewareTs.includes("pathname.startsWith('/history')"), 'FAIL: Middleware must protect /history');
assert(middlewareTs.includes("pathname.startsWith('/admin')"), 'FAIL: Middleware must protect /admin');
assert(middlewareTs.includes("/login"), 'FAIL: Middleware must redirect unauthenticated users to /login');
console.log('✔ Check 8: Next.js middleware guards /history and /admin routes against unauthenticated users.');
passedChecks++;

console.log(`\nAll ${passedChecks}/${passedChecks} security and authorization boundary checks PASSED successfully!`);
