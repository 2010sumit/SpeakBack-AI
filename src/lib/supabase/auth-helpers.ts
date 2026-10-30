import { createClient } from './server';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anon && !url.includes('placeholder') && !anon.includes('placeholder'));
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }
  return user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // If trigger has not fired yet, return basic profile object with role 'user'
    return {
      id: user.id,
      email: user.email || null,
      phone: user.phone || null,
      role: 'user',
      display_name: null,
      created_at: user.created_at,
      updated_at: user.created_at,
    };
  }

  return profile as UserProfile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  const profile = await getCurrentProfile();
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireAuth();
  if (!profile || profile.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return { user, profile };
}
