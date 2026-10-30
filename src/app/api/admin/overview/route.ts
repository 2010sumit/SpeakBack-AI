import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAuditLog } from '@/lib/supabase/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, profile } = await requireAdmin();

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // 1. Total users
    const { count: usersCount, error: usersErr } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Total learning sessions
    const { count: sessionsCount, error: sessErr } = await client
      .from('learning_sessions')
      .select('*', { count: 'exact', head: true });

    // 3. Language breakdown
    const { data: langData, error: langErr } = await client
      .from('learning_sessions')
      .select('language');

    const languageBreakdown: Record<string, number> = { en: 0, hi: 0, pa: 0 };
    if (langData) {
      langData.forEach((row: { language: string }) => {
        const lang = row.language || 'en';
        languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
      });
    }

    // 4. Recent audit logs
    const { data: recentLogs, error: logErr } = await client
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);

    // Record this overview view in audit log
    await recordAdminAuditLog({
      adminId: user.id,
      action: 'VIEW_ADMIN_OVERVIEW',
      targetType: 'system_metrics',
      ipAddress: req.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({
      metrics: {
        totalUsers: usersCount || 0,
        totalSessions: sessionsCount || 0,
        languageBreakdown,
      },
      recentLogs: recentLogs || [],
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access Denied: Admin authorization required' }, { status: 403 });
    }
    console.error('Admin overview error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
