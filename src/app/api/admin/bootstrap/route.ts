import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAuditLog } from '@/lib/supabase/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const serverSecret = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();

  if (!serverSecret) {
    return NextResponse.json(
      {
        error:
          'ADMIN_BOOTSTRAP_SECRET is not configured in the server environment. To bootstrap the first administrator safely, run the following SQL query in your Supabase SQL editor: UPDATE public.profiles SET role = \'admin\' WHERE email = \'your-email@example.com\';',
      },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { secret, email } = body || {};

  if (!secret || secret !== serverSecret) {
    return NextResponse.json({ error: 'Invalid bootstrap secret' }, { status: 403 });
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
  }

  try {
    const adminClient = createAdminClient();

    const { data: profile, error } = await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', email.trim())
      .select()
      .single();

    if (error || !profile) {
      return NextResponse.json(
        {
          error: `User with email "${email}" not found in profiles. Please register the user account in the app first before promoting to admin.`,
        },
        { status: 404 }
      );
    }

    await recordAdminAuditLog({
      adminId: profile.id,
      action: 'BOOTSTRAP_ADMIN_PROMOTION',
      targetType: 'user_role',
      targetId: profile.id,
      details: { email: profile.email, promotedRole: 'admin' },
      ipAddress: req.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} has been successfully promoted to administrator.`,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bootstrap error' }, { status: 500 });
  }
}
