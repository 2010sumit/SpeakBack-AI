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
    const userId = searchParams.get('userId')?.trim() || '';

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    let dbQuery = client
      .from('learning_sessions')
      .select('id, user_id, title, language, summary, created_at, checklist_progress, quiz_results')
      .order('created_at', { ascending: false });

    if (userId) {
      dbQuery = dbQuery.eq('user_id', userId);
    }

    if (query) {
      dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    const { data: sessions, error } = await dbQuery.limit(50);

    if (error) {
      throw error;
    }

    await recordAdminAuditLog({
      adminId: user.id,
      action: 'INSPECT_LEARNING_SESSIONS',
      targetType: 'learning_sessions',
      details: { query, userId, count: sessions?.length || 0 },
      ipAddress: req.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ sessions: sessions || [] });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access Denied: Admin authorization required' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error fetching sessions' }, { status: 500 });
  }
}
