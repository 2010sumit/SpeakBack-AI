import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';

export const dynamic = 'force-dynamic';

// GET /api/sessions - List sessions belonging to the authenticated user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to view your learning history.' },
      { status: 401 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('id, title, language, summary, created_at, updated_at, checklist_progress, quiz_results')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user sessions:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data || [] });
}

// POST /api/sessions - Persist a new completed learning session
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to save learning sessions.' },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const {
    title,
    language = 'en',
    transcript,
    summary = '',
    beginnerExplanation = '',
    importantConcepts = [],
    actionChecklist = [],
    quizQuestions = [],
    troubleshootingTips = [],
    sourceExcerpts = [],
    checklistProgress = {},
    quizResults = {},
  } = body || {};

  if (!title || !transcript) {
    return NextResponse.json(
      { error: 'Session title and tutorial transcript are required.' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('learning_sessions')
    .insert({
      user_id: user.id,
      title: title.trim(),
      language,
      transcript: transcript.trim(),
      summary,
      beginner_explanation: beginnerExplanation,
      important_concepts: importantConcepts,
      action_checklist: actionChecklist,
      quiz_questions: quizQuestions,
      troubleshooting_tips: troubleshootingTips,
      source_excerpts: sourceExcerpts,
      checklist_progress: checklistProgress,
      quiz_results: quizResults,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating learning session:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session: data }, { status: 201 });
}
