export type SupportedLanguage = 'en' | 'hi' | 'pa';

export type ContentCategory = 'technical' | 'personal' | 'educational';

export interface ActionStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  command?: string | null;
  isCompleted?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ImportantConcept {
  term: string;
  definition: string;
}

export interface TutorialExplanation {
  title: string;
  summary: string;
  beginnerExplanation: string;
  importantConcepts: ImportantConcept[];
  actionChecklist: ActionStep[];
  quizQuestions: QuizQuestion[];
  troubleshootingTips: string[];
  sourceExcerpts: string[];
  contentType?: ContentCategory;
  isDemoMode?: boolean;
  demoMessage?: string;
  provider?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sourceReference?: string;
}

export interface FollowUpResponse {
  answer: string;
  sourceReference?: string;
  clarificationNeeded?: boolean;
  isDemoMode?: boolean;
  provider?: string;
}
