import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const apiKey = process.env.WISPR_FLOW_API_KEY?.trim();

  // If Wispr Flow API key is not configured
  if (!apiKey) {
    return NextResponse.json(
      {
        configured: false,
        error: 'WISPR_FLOW_API_KEY_NOT_CONFIGURED',
        message:
          'Wispr Flow Voice Interface API key is not configured in the server environment (.env.local). Voice dictation is operating via browser Web Speech API and the system-wide Wispr Flow desktop dictation assistant.',
      },
      { status: 200 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No valid audio file received. Audio payload is required.' },
        { status: 400 }
      );
    }

    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Empty audio recording. Please speak into the microphone.' },
        { status: 400 }
      );
    }

    // Proxy audio to Wispr Flow Voice Interface API
    const wisprFormData = new FormData();
    wisprFormData.append('file', audioFile, 'recording.wav');

    const wisprRes = await fetch('https://platform-api.wisprflow.ai/api/v1/dash/api', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: wisprFormData,
    });

    if (!wisprRes.ok) {
      const errorText = await wisprRes.text();
      console.warn('Wispr Flow API error response:', wisprRes.status, errorText);
      return NextResponse.json(
        {
          error: `Wispr Flow API returned status ${wisprRes.status}`,
          details: errorText,
        },
        { status: wisprRes.status }
      );
    }

    const data = await wisprRes.json();
    return NextResponse.json({
      text: data.text || data.transcription || '',
      provider: 'Wispr Flow Voice Interface API',
    });
  } catch (err: any) {
    console.error('Error proxying to Wispr Flow API:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error processing audio transcription.' },
      { status: 500 }
    );
  }
}

// GET endpoint to query voice provider status without exposing credentials
export async function GET() {
  const isWisprConfigured = Boolean(process.env.WISPR_FLOW_API_KEY?.trim());
  return NextResponse.json({
    wisprApiConfigured: isWisprConfigured,
    provider: isWisprConfigured ? 'Wispr Flow Voice Interface API' : 'Browser Web Speech API & Wispr Desktop',
  });
}
