import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

// GET /api/sessions/[id] - Retrieve single session (with ownership verification)
export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Enforce user isolation
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ session: data });
}

// PATCH /api/sessions/[id] - Update checklist progress or quiz results
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  }

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (body.checklistProgress !== undefined) {
    updates.checklist_progress = body.checklistProgress;
  }

  if (body.quizResults !== undefined) {
    updates.quiz_results = body.quizResults;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('learning_sessions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id) // Enforce user isolation
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update session or session not found.' }, { status: 404 });
  }

  return NextResponse.json({ session: data });
}

// DELETE /api/sessions/[id] - Delete session
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const supabase = createClient();
  const { error } = await supabase
    .from('learning_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Enforce user isolation

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Session deleted successfully.' });
}
