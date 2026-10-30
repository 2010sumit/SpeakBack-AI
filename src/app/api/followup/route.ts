import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpAnswer } from '@/lib/aiProvider';
import { SupportedLanguage } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, transcript, language = 'en' } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter or speak a question to ask.' },
        { status: 400 }
      );
    }

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'No tutorial context found. Please submit a tutorial first.' },
        { status: 400 }
      );
    }

    const validLangs: SupportedLanguage[] = ['en', 'hi', 'pa'];
    const chosenLang: SupportedLanguage = validLangs.includes(language as SupportedLanguage)
      ? (language as SupportedLanguage)
      : 'en';

    const result = await generateFollowUpAnswer(question.trim(), transcript.trim(), chosenLang);

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API Error in /api/followup:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate answer.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
