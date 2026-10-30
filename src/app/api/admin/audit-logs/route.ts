import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAuditLog } from '@/lib/supabase/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAdmin();

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    const { data: logs, error } = await client
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    await recordAdminAuditLog({
      adminId: user.id,
      action: 'VIEW_AUDIT_LOG_ARCHIVE',
      targetType: 'admin_audit_logs',
      ipAddress: req.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ logs: logs || [] });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access Denied: Admin authorization required' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error fetching audit logs' }, { status: 500 });
  }
}
