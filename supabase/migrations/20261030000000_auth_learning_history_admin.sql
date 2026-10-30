-- ====================================================================
-- SpeakBack AI - Database Migration
-- Auth Profiles, Learning Sessions, Checklist Progress, Quiz Results & Admin Audit Logs
-- ====================================================================

-- 1. Create Profiles Table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Security Definer Function to Check Admin Role Safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Profiles RLS Policies
-- Allow users to view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Allow users to update their own display_name (prevent role self-escalation)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Allow admins to update user profiles (e.g., manage roles)
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Trigger to automatically create a profile on new user registration in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'user' -- Normal registered users MUST default to 'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Create Learning Sessions Table (stores tutorial explanations, checklists, and quiz results)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  transcript TEXT NOT NULL,
  summary TEXT,
  beginner_explanation TEXT,
  important_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  troubleshooting_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_excerpts JSONB NOT NULL DEFAULT '[]'::jsonb,
  checklist_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  quiz_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created_at ON public.learning_sessions(created_at DESC);

-- Enable RLS on learning_sessions
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- Learning Sessions Policies:
-- Users can view only their own sessions
CREATE POLICY "sessions_select_own"
  ON public.learning_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all sessions for support and audit
CREATE POLICY "sessions_select_admin"
  ON public.learning_sessions
  FOR SELECT
  USING (public.is_admin());

-- Users can insert only their own sessions
CREATE POLICY "sessions_insert_own"
  ON public.learning_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own sessions
CREATE POLICY "sessions_update_own"
  ON public.learning_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own sessions
CREATE POLICY "sessions_delete_own"
  ON public.learning_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes on audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Enable RLS on admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_select_admin"
  ON public.admin_audit_logs
  FOR SELECT
  USING (public.is_admin());

-- Only admins or service_role can insert audit logs
CREATE POLICY "audit_logs_insert_admin"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

-- 7. Documented Helper: First Admin Promotion
-- To bootstrap the first administrator safely, run this SQL in the Supabase SQL editor:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
