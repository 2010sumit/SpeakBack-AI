import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAuditLog } from '@/lib/supabase/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    let dbQuery = client
      .from('profiles')
      .select('id, email, phone, role, display_name, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (query) {
      dbQuery = dbQuery.or(`email.ilike.%${query}%,phone.ilike.%${query}%,id.ilike.%${query}%`);
    }

    const { data: profiles, error } = await dbQuery.limit(50);

    if (error) {
      throw error;
    }

    // Get count of learning sessions per user
    const userIds = (profiles || []).map((p: { id: string }) => p.id);
    let sessionCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: sessionRows } = await client
        .from('learning_sessions')
        .select('user_id')
        .in('user_id', userIds);

      if (sessionRows) {
        sessionRows.forEach((r: { user_id: string }) => {
          sessionCounts[r.user_id] = (sessionCounts[r.user_id] || 0) + 1;
        });
      }
    }

    const usersWithStats = (profiles || []).map((p: any) => ({
      ...p,
      sessionsCount: sessionCounts[p.id] || 0,
    }));

    await recordAdminAuditLog({
      adminId: user.id,
      action: 'SEARCH_USERS',
      targetType: 'user_directory',
      details: { query, resultsCount: usersWithStats.length },
      ipAddress: req.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access Denied: Admin authorization required' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error fetching users' }, { status: 500 });
  }
}
