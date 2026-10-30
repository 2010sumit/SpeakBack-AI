import { SupportedLanguage, TutorialExplanation, FollowUpResponse, ContentCategory } from '@/types';
import { ViaSocket } from 'viasocket-apps';

// Helper to get language name in English and target script
function getLanguageLabel(language: SupportedLanguage): string {
  switch (language) {
    case 'hi':
      return 'Hindi (हिंदी)';
    case 'pa':
      return 'Punjabi (ਪੰਜਾਬੀ)';
    case 'en':
    default:
      return 'English';
  }
}

// Inspect input text to determine content category
export function detectContentCategory(text: string): ContentCategory {
  const lower = text.toLowerCase();
  
  // Strong programming and technical indicators
  const technicalKeywords = [
    'npm', 'npx', 'yarn', 'pnpm', 'git', 'github', 'docker', 'terminal', 'bash', 'cli',
    'node.js', 'nodejs', 'react', 'next.js', 'nextjs', 'express', 'python', 'javascript',
    'typescript', 'api', 'endpoint', 'database', 'sql', 'postgres', 'mongodb', 'html',
    'css', 'server.js', 'package.json', 'const ', 'let ', 'var ', 'function', 'import ',
    'export ', 'return ', 'console.log', 'async', 'await', 'curl', 'http://', 'https://',
    'port 3000', 'localhost', 'sudo ', 'apt-get', 'pip install', 'class ', 'def '
  ];

  const hasTechnicalMatch = technicalKeywords.some(keyword => lower.includes(keyword));
  if (hasTechnicalMatch) {
    return 'technical';
  }

  // Personal narrative indicators (first-person pronouns, travel, memories, emotions)
  const personalKeywords = [
    ' i ', ' my ', ' me ', ' we ', ' our ', 'travel', 'trip', 'visited', 'journey',
    'vacation', 'holiday', 'childhood', 'remember', 'experience', 'feeling', 'story',
    'village', 'morning', 'dinner', 'family', 'friend', 'peaceful', 'beautiful', 'autumn',
    'summer', 'winter', 'spring', 'mountain', 'shrine', 'temple', 'hotel', 'flight'
  ];

  const personalMatches = personalKeywords.filter(k => lower.includes(k)).length;
  if (personalMatches >= 2 || lower.startsWith('i ') || lower.startsWith('last ') || lower.startsWith('when i ')) {
    return 'personal';
  }

  return 'educational';
}

// ====================================================================
// Primary Content Generation Pipeline
// ====================================================================

export async function generateTutorialExplanation(
  transcript: string,
  language: SupportedLanguage
): Promise<TutorialExplanation> {
  const viasocketOrg = process.env.VIASOCKET_ORG_ID?.trim();
  const viasocketProject = process.env.VIASOCKET_PROJECT_ID?.trim();
  const viasocketSecret = process.env.VIASOCKET_EMBED_SECRET?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const aigiKey = process.env.AIGI_API_KEY?.trim();
  const aigiBaseUrl = process.env.AIGI_BASE_URL?.trim();

  // 1. Try viaSocket AI (First preferred provider)
  if (viasocketOrg && viasocketProject && viasocketSecret) {
    try {
      const response = await callViaSocketAPI(transcript, language, {
        orgId: viasocketOrg,
        projectId: viasocketProject,
        secret: viasocketSecret,
      });
      if (response) {
        return {
          ...response,
          isDemoMode: false,
          provider: 'viaSocket AI',
        };
      }
    } catch (err: any) {
      console.warn('viaSocket AI generation failed, checking alternatives:', err.message || err);
    }
  }

  // 2. Try OpenAI (Second preferred provider)
  if (openAiKey) {
    try {
      const response = await callOpenAIAPI(transcript, language, openAiKey);
      if (response) {
        return {
          ...response,
          isDemoMode: false,
          provider: 'OpenAI (gpt-4o-mini)',
        };
      }
    } catch (err: any) {
      console.warn('OpenAI generation failed, checking alternatives:', err.message || err);
    }
  }

  // 3. Try AIGI (Third preferred provider if configured)
  if (aigiKey && aigiBaseUrl) {
    try {
      const response = await callAigiAPI(transcript, language, aigiKey, aigiBaseUrl);
      if (response) {
        return {
          ...response,
          isDemoMode: false,
          provider: 'AIGI Platform',
        };
      }
    } catch (err: any) {
      console.warn('AIGI generation failed:', err.message || err);
    }
  }

  // 4. Honest Grounded Fallback Synthesizer (Demo Mode)
  // Strictly grounded in the actual input text — NEVER hallucinates coding for stories!
  return generateGroundedDemoExplanation(transcript, language);
}

export async function generateFollowUpAnswer(
  question: string,
  transcript: string,
  language: SupportedLanguage
): Promise<FollowUpResponse> {
  const viasocketOrg = process.env.VIASOCKET_ORG_ID?.trim();
  const viasocketProject = process.env.VIASOCKET_PROJECT_ID?.trim();
  const viasocketSecret = process.env.VIASOCKET_EMBED_SECRET?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const aigiKey = process.env.AIGI_API_KEY?.trim();
  const aigiBaseUrl = process.env.AIGI_BASE_URL?.trim();

  if (viasocketOrg && viasocketProject && viasocketSecret) {
    try {
      const result = await callViaSocketFollowUp(question, transcript, language, {
        orgId: viasocketOrg,
        projectId: viasocketProject,
        secret: viasocketSecret,
      });
      if (result) {
        return {
          answer: result.answer,
          sourceReference: result.sourceReference,
          isDemoMode: false,
          provider: 'viaSocket AI',
        };
      }
    } catch (err) {
      console.warn('viaSocket follow-up failed:', err);
    }
  } else if (openAiKey) {
    try {
      const result = await callOpenAIFollowUp(question, transcript, language, openAiKey);
      if (result) {
        return {
          answer: result.answer,
          sourceReference: result.sourceReference,
          isDemoMode: false,
          provider: 'OpenAI (gpt-4o-mini)',
        };
      }
    } catch (err) {
      console.warn('OpenAI follow-up failed:', err);
    }
  } else if (aigiKey && aigiBaseUrl) {
    try {
      const result = await callAigiFollowUp(question, transcript, language, aigiKey, aigiBaseUrl);
      if (result) {
        return {
          answer: result.answer,
          sourceReference: result.sourceReference,
          isDemoMode: false,
          provider: 'AIGI Platform',
        };
      }
    } catch (err) {
      console.warn('AIGI follow-up failed:', err);
    }
  }

  return generateGroundedDemoFollowUp(question, transcript, language);
}

// ====================================================================
// Real viaSocket AI Adapter
// ====================================================================

async function callViaSocketAPI(
  transcript: string,
  language: SupportedLanguage,
  creds: { orgId: string; projectId: string; secret: string }
): Promise<TutorialExplanation | null> {
  const vs = new ViaSocket({
    orgId: creds.orgId,
    projectId: creds.projectId,
    secret: creds.secret,
  });

  const user = vs.user('speakback-workspace');
  const targetLanguage = getLanguageLabel(language);

  const prompt = `You are SpeakBack AI, an intelligent, patient learning copilot.
Analyze the user's submitted text and generate a structured JSON learning workspace.

Language of ALL generated fields MUST be strictly in ${targetLanguage}.

JSON Schema required:
{
  "title": string (concise, descriptive title reflecting the true subject),
  "contentType": "technical" | "personal" | "educational",
  "summary": string (2-3 sentences summarizing the actual content),
  "beginnerExplanation": string (clear, encouraging explanation suited for beginners),
  "importantConcepts": [{"term": string, "definition": string}],
  "actionChecklist": [{"id": string, "stepNumber": number, "title": string, "description": string, "command": string | null}],
  "quizQuestions": [{"id": string, "question": string, "options": [string, string, string, string], "correctAnswerIndex": number (0-3), "explanation": string}],
  "troubleshootingTips": [string],
  "sourceExcerpts": [string] (exact quotes from the input)
}

CRITICAL ACCURACY & GROUNDING RULES:
1. First, inspect the text to classify its contentType:
   - "technical": for coding tutorials, terminal guides, software setup.
   - "personal": for personal narratives, travel memories, personal reflections, diary entries.
   - "educational": for history, science, literature, general informative articles.
2. If contentType is "personal" or "educational":
   - NEVER fabricate terminal commands, code syntax, or programming instructions.
   - Set "command" to null for all action items.
   - The actionChecklist must contain meaningful reflections, takeaways, or cultural appreciation steps directly related to the passage.
   - Quiz questions MUST test comprehension of real facts, names, locations, and events mentioned in the text.
3. If contentType is "technical":
   - Accurately preserve coding commands verbatim. Only set "command" if a real shell/CLI command applies.
   - Order the steps sequentially.
4. Every sourceExcerpts item MUST be a real quote taken directly from the input text.
5. Return strictly valid JSON only.`;

  const reply = await user.ai.send({
    message: `${prompt}\n\nSubmitted Source Text:\n"""\n${transcript}\n"""`,
    responseType: 'json_object',
  });

  if (!reply?.content) return null;

  const parsed = typeof reply.content === 'object' ? reply.content : JSON.parse(reply.content);
  return validateAndSanitizeExplanation(parsed, transcript, language);
}

async function callViaSocketFollowUp(
  question: string,
  transcript: string,
  language: SupportedLanguage,
  creds: { orgId: string; projectId: string; secret: string }
): Promise<{ answer: string; sourceReference?: string } | null> {
  const vs = new ViaSocket({
    orgId: creds.orgId,
    projectId: creds.projectId,
    secret: creds.secret,
  });

  const user = vs.user('speakback-workspace');
  const targetLanguage = getLanguageLabel(language);

  const prompt = `You are SpeakBack AI. A learner asks a question about the provided text:
Text:
"""
${transcript}
"""

Question: "${question}"

Provide a concise, helpful answer in ${targetLanguage}.
GROUNDING RULES:
1. Base your answer only on what is supported by the text.
2. If the text does NOT contain the answer, state clearly in ${targetLanguage} that the provided source text does not mention this information.
3. If relevant, cite a brief excerpt from the text as your reference.

Return valid JSON with keys:
{
  "answer": string,
  "sourceReference": string | null
}`;

  const reply = await user.ai.send({
    message: prompt,
    responseType: 'json_object',
  });

  if (!reply?.content) return null;
  const parsed = typeof reply.content === 'object' ? reply.content : JSON.parse(reply.content);
  return {
    answer: parsed.answer || String(reply.content),
    sourceReference: parsed.sourceReference || undefined,
  };
}

// ====================================================================
// Real OpenAI Adapter
// ====================================================================

async function callOpenAIAPI(
  transcript: string,
  language: SupportedLanguage,
  apiKey: string
): Promise<TutorialExplanation | null> {
  const targetLanguage = getLanguageLabel(language);

  const systemPrompt = `You are SpeakBack AI, an intelligent, patient learning copilot.
Analyze the user's submitted text and generate a structured JSON learning workspace in ${targetLanguage}.

Schema:
{
  "title": string,
  "contentType": "technical" | "personal" | "educational",
  "summary": string,
  "beginnerExplanation": string,
  "importantConcepts": [{"term": string, "definition": string}],
  "actionChecklist": [{"id": string, "stepNumber": number, "title": string, "description": string, "command": string | null}],
  "quizQuestions": [{"id": string, "question": string, "options": [string, string, string, string], "correctAnswerIndex": number, "explanation": string}],
  "troubleshootingTips": [string],
  "sourceExcerpts": [string]
}

RULES:
1. If the text is a personal story or non-technical, DO NOT invent coding commands or programming steps. Set command: null. Provide personal reflection steps and reading comprehension questions.
2. If the text is technical, preserve commands and dependencies.
3. Ground everything in the source text. Return valid JSON only.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;
  return validateAndSanitizeExplanation(JSON.parse(text), transcript, language);
}

async function callOpenAIFollowUp(
  question: string,
  transcript: string,
  language: SupportedLanguage,
  apiKey: string
): Promise<{ answer: string; sourceReference?: string } | null> {
  const targetLanguage = getLanguageLabel(language);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are SpeakBack AI. Answer grounded strictly in the provided text in ${targetLanguage}. If the source text does not support the answer, state that clearly. Return JSON with "answer" and "sourceReference".`,
        },
        {
          role: 'user',
          content: `Source text:\n${transcript}\n\nQuestion: ${question}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;
  const parsed = JSON.parse(text);
  return {
    answer: parsed.answer || text,
    sourceReference: parsed.sourceReference || undefined,
  };
}

// ====================================================================
// AIGI Adapter (Fallback if configured)
// ====================================================================

async function callAigiAPI(
  transcript: string,
  language: SupportedLanguage,
  apiKey: string,
  baseUrl: string
): Promise<TutorialExplanation | null> {
  const targetLanguage = getLanguageLabel(language);
  const model = process.env.AIGI_MODEL || 'default';

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are SpeakBack AI. Analyze the text in ${targetLanguage} and return valid JSON with title, contentType, summary, beginnerExplanation, importantConcepts, actionChecklist, quizQuestions, troubleshootingTips, sourceExcerpts. Ground strictly in the text without fabricating coding commands for non-technical passages.`,
        },
        { role: 'user', content: transcript },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;
  return validateAndSanitizeExplanation(JSON.parse(text), transcript, language);
}

async function callAigiFollowUp(
  question: string,
  transcript: string,
  language: SupportedLanguage,
  apiKey: string,
  baseUrl: string
): Promise<{ answer: string; sourceReference?: string } | null> {
  const targetLanguage = getLanguageLabel(language);
  const model = process.env.AIGI_MODEL || 'default';

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are SpeakBack AI. Answer the user question based strictly on the provided text in ${targetLanguage}. If unmentioned, state so clearly.`,
        },
        { role: 'user', content: `Text:\n${transcript}\n\nQuestion: ${question}` },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content;
  return answer ? { answer } : null;
}

// ====================================================================
// Validation & Sanitization
// ====================================================================

function validateAndSanitizeExplanation(
  raw: any,
  transcript: string,
  language: SupportedLanguage
): TutorialExplanation {
  const category = (raw.contentType as ContentCategory) || detectContentCategory(transcript);

  const cleanSteps = Array.isArray(raw.actionChecklist)
    ? raw.actionChecklist.map((s: any, idx: number) => ({
        id: s.id || `step-${idx + 1}`,
        stepNumber: s.stepNumber || idx + 1,
        title: s.title || `Step ${idx + 1}`,
        description: s.description || '',
        // For non-technical passages, strictly force command to null
        command: category === 'technical' && s.command ? String(s.command).trim() : null,
      }))
    : [];

  const cleanQuiz = Array.isArray(raw.quizQuestions)
    ? raw.quizQuestions.map((q: any, idx: number) => ({
        id: q.id || `q-${idx + 1}`,
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options.map(String)
          : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3
          ? q.correctAnswerIndex
          : 0,
        explanation: q.explanation || 'Refer to the source text for the correct answer.',
      }))
    : [];

  const cleanConcepts = Array.isArray(raw.importantConcepts)
    ? raw.importantConcepts.map((c: any) => ({
        term: c.term || 'Key Concept',
        definition: c.definition || '',
      }))
    : [];

  const cleanTips = Array.isArray(raw.troubleshootingTips)
    ? raw.troubleshootingTips.map(String)
    : [];

  const cleanExcerpts = Array.isArray(raw.sourceExcerpts)
    ? raw.sourceExcerpts.map(String)
    : [];

  return {
    title: raw.title || 'Extracted Learning Workspace',
    contentType: category,
    summary: raw.summary || '',
    beginnerExplanation: raw.beginnerExplanation || '',
    importantConcepts: cleanConcepts,
    actionChecklist: cleanSteps,
    quizQuestions: cleanQuiz,
    troubleshootingTips: cleanTips,
    sourceExcerpts: cleanExcerpts,
    isDemoMode: false,
  };
}

// ====================================================================
// Intelligent Grounded Synthesizer (Demo Mode / Offline Fallback)
// Never outputs generic Express.js or fake coding steps for stories!
// ====================================================================

function generateGroundedDemoExplanation(
  transcript: string,
  language: SupportedLanguage
): TutorialExplanation {
  const category = detectContentCategory(transcript);
  const sentences = transcript.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [transcript.trim()];
  const cleanSentences = sentences.filter(s => s.length > 10);
  const lines = transcript.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Extract a sensible title
  const firstSentence = cleanSentences[0] || lines[0] || 'Learning Workspace';
  const derivedTitle = firstSentence.slice(0, 60).replace(/[.!?]+$/, '');

  const demoNotes: Record<SupportedLanguage, string> = {
    en: 'Demo Mode (Source Grounded) — Synthesized directly from your submitted text.',
    hi: 'डेमो मोड (स्रोत आधारित) — आपके द्वारा दिए गए टेक्स्ट से सीधे तैयार किया गया।',
    pa: 'ਡੈਮੋ ਮੋਡ (ਸਰੋਤ ਆਧਾਰਿਤ) — ਤੁਹਾਡੇ ਦਿੱਤੇ ਟੈਕਸਟ ਤੋਂ ਸਿੱਧਾ ਤਿਆਰ ਕੀਤਾ ਗਿਆ।',
  };

  // Case 1: Personal Narrative or Story
  if (category === 'personal') {
    const summaryMap: Record<SupportedLanguage, string> = {
      en: `A reflective narrative covering: "${cleanSentences.slice(0, 2).join(' ')}"`,
      hi: `यह व्यक्तिगत अनुभव इस विषय पर केंद्रित है: "${cleanSentences.slice(0, 2).join(' ')}"`,
      pa: `ਇਹ ਨਿੱਜੀ ਕਹਾਣੀ ਇਸ ਬਾਰੇ ਦੱਸਦੀ ਹੈ: "${cleanSentences.slice(0, 2).join(' ')}"`,
    };

    const beginnerMap: Record<SupportedLanguage, string> = {
      en: 'This personal passage shares lived experiences, observations, and key reflections. Follow along to absorb the context, key details, and personal insights.',
      hi: 'यह व्यक्तिगत विवरण वास्तविक अनुभवों, अवलोकनों और महत्वपूर्ण विचारों को साझा करता है। संदर्भ, मुख्य विवरणों और व्यक्तिगत सीख को समझने के लिए इसे ध्यान से पढ़ें।',
      pa: 'ਇਹ ਵੇਰਵਾ ਨਿੱਜੀ ਤਜ਼ਰਬਿਆਂ ਅਤੇ ਵਿਚਾਰਾਂ ਨੂੰ ਸਾਂਝਾ ਕਰਦਾ ਹੈ। ਪਾਠ ਦੇ ਮੁੱਖ ਨੁਕਤਿਆਂ ਅਤੇ ਸਿੱਖਿਆਵਾਂ ਨੂੰ ਸਮਝਣ ਲਈ ਧਿਆਨ ਨਾਲ ਪੜ੍ਹੋ।',
    };

    // Extract proper nouns or key vocabulary
    const words = transcript.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    const uniqueEntities = Array.from(new Set(words)).slice(0, 3);
    const concepts = uniqueEntities.length > 0
      ? uniqueEntities.map(entity => ({
          term: entity,
          definition: `Significant person, location, or element highlighted in the narrative.`,
        }))
      : [
          {
            term: 'Personal Reflection',
            definition: 'An insight or realization gained from the shared experience.',
          },
          {
            term: 'Narrative Context',
            definition: 'The setting, background, and circumstances described in the passage.',
          },
        ];

    // Checklist: Reflection & Takeaways (NO commands!)
    const steps = cleanSentences.slice(0, 3).map((sent, i) => ({
      id: `step-${i + 1}`,
      stepNumber: i + 1,
      title: i === 0 ? 'Understand the Setting' : i === 1 ? 'Notice Key Experiences' : 'Reflect on Takeaways',
      description: sent,
      command: null,
    }));

    // Quiz: Comprehension questions directly from the sentences
    const quizQuestions = [
      {
        id: 'q-personal-1',
        question: `Based on the text, what central theme or experience is described?`,
        options: [
          cleanSentences[0]?.slice(0, 80) || 'The personal journey described in the text',
          'Writing computer software in a terminal',
          'Deploying an Express web server',
          'Running database migrations',
        ],
        correctAnswerIndex: 0,
        explanation: 'The passage directly opens with this personal experience.',
      },
      {
        id: 'q-personal-2',
        question: `Which detail is directly supported by the submitted passage?`,
        options: [
          cleanSentences[1]?.slice(0, 80) || cleanSentences[0]?.slice(0, 80) || 'Details described by the author',
          'The author configured a Linux cloud server',
          'The author used a package manager command',
          'The text explains how to debug code',
        ],
        correctAnswerIndex: 0,
        explanation: 'This fact is stated directly in the provided text.',
      },
      {
        id: 'q-personal-3',
        question: `What tone does the narrator convey in this passage?`,
        options: [
          'Personal, observational, and reflective',
          'Strictly technical and algorithmic',
          'A command-line terminal tutorial',
          'An angry product review',
        ],
        correctAnswerIndex: 0,
        explanation: 'The narrator recounts their experience in a personal, descriptive tone.',
      },
    ];

    return {
      title: derivedTitle || 'Personal Narrative Reflection',
      contentType: 'personal',
      summary: summaryMap[language],
      beginnerExplanation: beginnerMap[language],
      importantConcepts: concepts,
      actionChecklist: steps,
      quizQuestions,
      troubleshootingTips: [
        'Pay attention to setting details and descriptive language used by the author.',
        'Distinguish personal reflections from factual events in the story.',
      ],
      sourceExcerpts: cleanSentences.slice(0, 2),
      isDemoMode: true,
      demoMessage: demoNotes[language],
      provider: 'Grounded Synthesizer (Demo Mode)',
    };
  }

  // Case 2: General Educational Passage
  if (category === 'educational') {
    const summaryMap: Record<SupportedLanguage, string> = {
      en: `An educational summary exploring: "${cleanSentences.slice(0, 2).join(' ')}"`,
      hi: `एक शैक्षणिक सारांश जो इस विषय को समझाता है: "${cleanSentences.slice(0, 2).join(' ')}"`,
      pa: `ਇੱਕ ਵਿਦਿਅਕ ਸਾਰ ਜੋ ਇਸ ਵਿਸ਼ੇ ਨੂੰ ਸਮਝਾਉਂਦਾ ਹੈ: "${cleanSentences.slice(0, 2).join(' ')}"`,
    };

    const beginnerMap: Record<SupportedLanguage, string> = {
      en: 'This passage introduces core concepts sequentially. Review the main ideas and verify your understanding using the practice questions below.',
      hi: 'यह सामग्री मुख्य विचारों को क्रमिक रूप से समझाती है। मुख्य बिंदुओं को पढ़ें और नीचे दिए गए अभ्यास प्रश्नों से अपनी समझ की जाँच करें।',
      pa: 'ਇਹ ਸਮੱਗਰੀ ਮੁੱਖ ਵਿਚਾਰਾਂ ਨੂੰ ਕ੍ਰਮਵਾਰ ਸਮਝਾਉਂਦੀ ਹੈ। ਮੁੱਖ ਨੁਕਤਿਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ ਅਤੇ ਹੇਠਾਂ ਦਿੱਤੇ ਪ੍ਰਸ਼ਨਾਂ ਨਾਲ ਆਪਣੀ ਸਮਝ ਦੀ ਜਾਂਚ ਕਰੋ।',
    };

    return {
      title: derivedTitle || 'Educational Subject Overview',
      contentType: 'educational',
      summary: summaryMap[language],
      beginnerExplanation: beginnerMap[language],
      importantConcepts: [
        {
          term: 'Core Topic',
          definition: cleanSentences[0]?.slice(0, 100) || 'The primary subject introduced in the text.',
        },
        {
          term: 'Supporting Evidence',
          definition: cleanSentences[1]?.slice(0, 100) || 'The explanation and details supporting the subject.',
        },
      ],
      actionChecklist: cleanSentences.slice(0, 3).map((sent, i) => ({
        id: `step-${i + 1}`,
        stepNumber: i + 1,
        title: `Key Learning Point ${i + 1}`,
        description: sent,
        command: null,
      })),
      quizQuestions: [
        {
          id: 'q-edu-1',
          question: 'What is the primary subject introduced in this passage?',
          options: [
            cleanSentences[0]?.slice(0, 80) || 'The subject defined in the opening sentence',
            'Setting up a Node.js web server',
            'Installing Python packages',
            'Troubleshooting terminal errors',
          ],
          correctAnswerIndex: 0,
          explanation: 'The passage directly introduces this as the main topic.',
        },
        {
          id: 'q-edu-2',
          question: 'Which statement accurately reflects the submitted text?',
          options: [
            cleanSentences[1]?.slice(0, 80) || cleanSentences[0]?.slice(0, 80) || 'Statement from the text',
            'The text is a tutorial on git version control',
            'The author discusses computer hardware',
            'The text contains terminal commands',
          ],
          correctAnswerIndex: 0,
          explanation: 'This fact is stated directly in the text.',
        },
      ],
      troubleshootingTips: [
        'Review the key terms and their context within the passage.',
        'Ensure you understand the relationship between the main thesis and supporting points.',
      ],
      sourceExcerpts: cleanSentences.slice(0, 2),
      isDemoMode: true,
      demoMessage: demoNotes[language],
      provider: 'Grounded Synthesizer (Demo Mode)',
    };
  }

  // Case 3: Technical Tutorial
  const commandMatches = transcript.match(/(npm\s+[a-z0-9_-]+|git\s+[a-z0-9_-]+|cd\s+[^\s]+|node\s+[^\s]+|pip\s+install\s+[^\s]+|docker\s+[^\s]+)/gi) || [];
  const uniqueCommands = Array.from(new Set(commandMatches));

  const steps = uniqueCommands.length > 0
    ? uniqueCommands.map((cmd, i) => ({
        id: `step-${i + 1}`,
        stepNumber: i + 1,
        title: `Run: ${cmd}`,
        description: `Execute \`${cmd}\` in your terminal as indicated in the tutorial.`,
        command: cmd,
      }))
    : cleanSentences.slice(0, 3).map((line, i) => ({
        id: `step-${i + 1}`,
        stepNumber: i + 1,
        title: `Action Step ${i + 1}`,
        description: line,
        command: null,
      }));

  return {
    title: derivedTitle || 'Technical Tutorial Walkthrough',
    contentType: 'technical',
    summary: `Technical tutorial guide based on: "${cleanSentences[0]?.slice(0, 160) || transcript.slice(0, 160)}..."`,
    beginnerExplanation:
      'This tutorial covers technical steps and implementation instructions. Follow the steps sequentially and verify each in your terminal.',
    importantConcepts: [
      {
        term: 'Prerequisite Setup',
        definition: 'Ensuring your development environment has required tools before proceeding.',
      },
      {
        term: 'Sequential Execution',
        definition: 'Running setup commands in order so dependent files exist before code executes.',
      },
    ],
    actionChecklist: steps,
    quizQuestions: [
      {
        id: 'q-tech-1',
        question: 'What is the first step when following this technical tutorial?',
        options: [
          'Verify prerequisites and set up your workspace environment',
          'Deploy immediately to production',
          'Skip terminal commands and write code directly',
          'Delete project configuration files',
        ],
        correctAnswerIndex: 0,
        explanation: 'Every technical walkthrough requires establishing the correct prerequisites first.',
      },
      {
        id: 'q-tech-2',
        question: 'Why should tutorial steps be performed in their given order?',
        options: [
          'Subsequent commands often depend on files or packages created by earlier steps',
          'Command sequence has no impact on execution',
          'It reboots your computer',
          'It changes your terminal color scheme',
        ],
        correctAnswerIndex: 0,
        explanation: 'Later steps depend on dependencies created by preceding commands.',
      },
    ],
    troubleshootingTips: [
      'Check terminal output for specific error codes if a command fails.',
      'Confirm you are executing commands from the correct root folder.',
    ],
    sourceExcerpts: cleanSentences.slice(0, 2),
    isDemoMode: true,
    demoMessage: demoNotes[language],
    provider: 'Grounded Synthesizer (Demo Mode)',
  };
}

// Grounded Follow-up response generator
function generateGroundedDemoFollowUp(
  question: string,
  transcript: string,
  language: SupportedLanguage
): FollowUpResponse {
  const qLower = question.toLowerCase();
  const transcriptLower = transcript.toLowerCase();

  // Find sentences in the transcript containing words from the question
  const qKeywords = qLower
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'with', 'from', 'have', 'does', 'about'].includes(w));

  const sentences = transcript.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [transcript];
  const matchingSentence = sentences.find(s => {
    const sLower = s.toLowerCase();
    return qKeywords.some(k => sLower.includes(k));
  });

  if (matchingSentence) {
    const responses: Record<SupportedLanguage, string> = {
      en: `Based on your source: "${matchingSentence}"`,
      hi: `आपके स्रोत के आधार पर: "${matchingSentence}"`,
      pa: `ਤੁਹਾਡੇ ਸਰੋਤ ਅਨੁਸਾਰ: "${matchingSentence}"`,
    };

    return {
      answer: responses[language],
      sourceReference: matchingSentence,
      isDemoMode: true,
      provider: 'Grounded Synthesizer (Demo Mode)',
    };
  }

  // If question words are completely absent from the source
  const notFoundResponses: Record<SupportedLanguage, string> = {
    en: `The submitted text does not contain specific information about "${question}". The source discusses: "${sentences[0]?.slice(0, 120)}..."`,
    hi: `दिए गए टेक्स्ट में "${question}" के बारे में विशेष जानकारी नहीं है। स्रोत इस बारे में है: "${sentences[0]?.slice(0, 120)}..."`,
    pa: `ਦਿੱਤੇ ਗਏ ਟੈਕਸਟ ਵਿੱਚ "${question}" ਬਾਰੇ ਕੋਈ ਖਾਸ ਜਾਣਕਾਰੀ ਨਹੀਂ ਹੈ। ਸਰੋਤ ਇਸ ਬਾਰੇ ਚਰਚਾ ਕਰਦਾ ਹੈ: "${sentences[0]?.slice(0, 120)}..."`,
  };

  return {
    answer: notFoundResponses[language],
    clarificationNeeded: true,
    isDemoMode: true,
    provider: 'Grounded Synthesizer (Demo Mode)',
  };
}
