'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion, ContentCategory } from '@/types';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface RevisionQuizProps {
  questions: QuizQuestion[];
  contentType?: ContentCategory;
  initialAnswers?: Record<string, number>;
  onAnswersChange?: (answers: Record<string, number>, score: number, total: number) => void;
}

export function RevisionQuiz({
  questions,
  contentType = 'technical',
  initialAnswers = {},
  onAnswersChange,
}: RevisionQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(initialAnswers);
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setSelectedAnswers(initialAnswers);
      const shown: Record<string, boolean> = {};
      Object.keys(initialAnswers).forEach((k) => (shown[k] = true));
      setShowResults(shown);
    }
  }, [initialAnswers]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] === undefined) {
      const updatedAnswers = { ...selectedAnswers, [questionId]: optionIndex };
      setSelectedAnswers(updatedAnswers);
      setShowResults((prev) => ({ ...prev, [questionId]: true }));

      if (onAnswersChange) {
        const score = questions.filter(
          (q) => updatedAnswers[q.id] === q.correctAnswerIndex
        ).length;
        onAnswersChange(updatedAnswers, score, questions.length);
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults({});
    if (onAnswersChange) {
      onAnswersChange({}, 0, questions.length);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswerIndex
  ).length;

  const headerTitle = contentType === 'personal'
    ? 'Reading Comprehension Check'
    : 'Knowledge Check — Practice Questions';

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="h-4 w-4" />
          <span>{headerTitle}</span>
        </div>

        {answeredCount > 0 && (
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-300">
              Score: <strong className="text-emerald-400 font-semibold">{correctCount}</strong> / {questions.length}
            </span>
            <button
              onClick={handleResetQuiz}
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition"
              title="Reset questions"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.slice(0, 4).map((q, qIndex) => {
          const userChoice = selectedAnswers[q.id];
          const isAnswered = userChoice !== undefined;
          const isCorrect = isAnswered && userChoice === q.correctAnswerIndex;

          return (
            <div
              key={q.id || qIndex}
              className="p-5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3.5"
            >
              {/* Question Title */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                  <span className="text-indigo-400 mr-1.5 font-bold">
                    Q{qIndex + 1}.
                  </span>
                  {q.question}
                </h3>

                {isAnswered && (
                  <span
                    className={`inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded font-medium shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIndex) => {
                  let buttonStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';

                  if (isAnswered) {
                    if (optIndex === q.correctAnswerIndex) {
                      buttonStyle = 'bg-emerald-950/40 border-emerald-600/70 text-emerald-300 font-medium';
                    } else if (optIndex === userChoice) {
                      buttonStyle = 'bg-red-950/40 border-red-600/70 text-red-300 line-through';
                    } else {
                      buttonStyle = 'bg-slate-950/40 border-slate-900 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      className={`text-left p-3 rounded-lg border text-xs sm:text-sm transition flex items-start space-x-2.5 ${buttonStyle}`}
                    >
                      <span className="h-5 w-5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Note */}
              {isAnswered && (
                <div className="mt-2.5 p-3 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-100 block mb-0.5">Explanation:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
