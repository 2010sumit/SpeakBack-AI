# SpeakBack AI — Auth, Persistence & Admin Setup Guide

This guide covers setting up Supabase Authentication, PostgreSQL persistence for user learning history, and the secure `/admin` dashboard.

---

## 1. Supabase Project Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** > **API**:
   - Copy the **Project URL**
   - Copy the **anon (public)** key
   - Copy the **service_role (secret)** key (keep this strictly server-side)
3. In your local SpeakBack AI folder, create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Populate the `.env.local` variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_BOOTSTRAP_SECRET=your-random-secure-secret-here
   ```

---

## 2. Apply Database Migrations & RLS Policies

1. Go to the **SQL Editor** in your Supabase Dashboard.
2. Open the version-controlled migration file:
   [`supabase/migrations/20261030000000_auth_learning_history_admin.sql`](./supabase/migrations/20261030000000_auth_learning_history_admin.sql)
3. Paste the contents into the SQL Editor and click **Run**.
4. This script sets up:
   - `public.profiles` table with automatic user creation trigger `on_auth_user_created`.
   - `public.is_admin()` security definer function.
   - `public.learning_sessions` table with foreign key `user_id -> auth.users(id)` and cascade deletion.
   - `public.admin_audit_logs` table for tracking administrative events.
   - Row Level Security (RLS) policies enforcing that ordinary users can only access their own records.
   - Indexes for fast querying on `user_id` and `created_at`.

---

## 3. Authentication Configuration

### Email Authentication
- Enabled by default in Supabase under **Authentication** > **Providers** > **Email**.
- Users can sign up with email and password or receive passwordless Magic Links.
- When an email confirmation link is clicked, it routes to `/auth/callback` to securely exchange the auth token for a persistent session.

### Phone / SMS OTP Authentication
1. Go to **Authentication** > **Providers** > **Phone**.
2. Toggle **Enable Phone Provider**.
3. Select your SMS provider (Twilio, MessageBird, or Vonage) and input your provider credentials.
4. Users can now enter their mobile number in E.164 format (e.g. `+14155552671` or `+919876543210`) on `/login` to receive and verify 6-digit SMS OTP codes.
5. If no SMS provider is configured, the UI clearly displays the provider requirement without failing unexpectedly.

---

## 4. Bootstrapping the First Administrator

Normal registered users **never** receive admin privileges automatically (they default to `role = 'user'`). To promote your account to administrator:

### Method A: Direct SQL (Recommended & Most Secure)
In your Supabase SQL Editor, run:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-registered-email@example.com';
```

### Method B: Server-Side Bootstrap API
If you configured `ADMIN_BOOTSTRAP_SECRET` in `.env.local`:
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-random-secure-secret-here",
    "email": "your-registered-email@example.com"
  }'
```
This updates the user's role to `'admin'` and logs the promotion event in `admin_audit_logs`.

---

## 5. Security & Authorization Boundaries

| Boundary | Enforcement Mechanism |
| :--- | :--- |
| **User Data Isolation** | PostgreSQL Row Level Security (RLS) ensures `auth.uid() = user_id`. API endpoints verify user identity via `@supabase/ssr`. |
| **Logged-Out Protection** | Next.js Middleware (`src/middleware.ts`) automatically redirects unauthenticated requests for `/history` or `/admin` to `/login`. |
| **Admin Authorization** | Server-side role check (`requireAdmin()`) verifies `profiles.role === 'admin'`. Unauthorized users receive `403 Forbidden`. Hiding the UI link is not relied upon for security. |
| **Audit Logging** | All sensitive admin actions (viewing users, searching sessions, reviewing audit trail, role changes) are recorded into `admin_audit_logs`. |
| **Account Deletion** | Calling `POST /api/user/delete-account` invokes `admin.deleteUser()`, cascading to delete the user's profile and all saved learning history. |
| **Secret Protection** | `SUPABASE_SERVICE_ROLE_KEY` is strictly server-side. No browser bundle contains database secrets. |

---

## 6. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js development server
npm run dev

# 3. Verify production build
npm run build
```
