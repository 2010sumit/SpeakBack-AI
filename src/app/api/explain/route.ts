import { NextRequest, NextResponse } from 'next/server';
import { generateTutorialExplanation } from '@/lib/aiProvider';
import { SupportedLanguage } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Please provide a tutorial transcript or paste your learning notes.' },
      { status: 400 }
    );
  }

  const { transcript, language = 'en' } = body || {};

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: 'Please provide a tutorial transcript or paste your learning notes.' },
      { status: 400 }
    );
  }

  if (transcript.trim().length < 15) {
    return NextResponse.json(
      { error: 'The transcript is too short. Please paste at least a couple of sentences from your tutorial.' },
      { status: 400 }
    );
  }

  if (transcript.length > 50000) {
    return NextResponse.json(
      { error: 'The transcript exceeds the 50,000 character limit. Please paste a shorter section.' },
      { status: 400 }
    );
  }

  const validLangs: SupportedLanguage[] = ['en', 'hi', 'pa'];
  const chosenLang: SupportedLanguage = validLangs.includes(language as SupportedLanguage)
    ? (language as SupportedLanguage)
    : 'en';

  try {
    const result = await generateTutorialExplanation(transcript.trim(), chosenLang);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API Error in /api/explain:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while analyzing the tutorial.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
