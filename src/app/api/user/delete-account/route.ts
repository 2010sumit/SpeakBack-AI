import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminSupabase = createAdminClient();
    // Delete user from auth.users (cascades to profiles and learning_sessions)
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('Error deleting user account:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated learning history have been permanently deleted.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
