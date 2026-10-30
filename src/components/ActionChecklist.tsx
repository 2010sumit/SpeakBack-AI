'use client';

import React, { useState, useEffect } from 'react';
import { ActionStep, ContentCategory } from '@/types';
import { CheckSquare, Copy, Check, Terminal } from 'lucide-react';

interface ActionChecklistProps {
  steps: ActionStep[];
  contentType?: ContentCategory;
  initialProgress?: Record<string, boolean>;
  onProgressChange?: (progress: Record<string, boolean>) => void;
}

export function ActionChecklist({
  steps,
  contentType = 'technical',
  initialProgress = {},
  onProgressChange,
}: ActionChecklistProps) {
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>(initialProgress);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialProgress && Object.keys(initialProgress).length > 0) {
      setCompletedIds(initialProgress);
    }
  }, [initialProgress]);

  const toggleStep = (id: string) => {
    setCompletedIds((prev) => {
      const updated = {
        ...prev,
        [id]: !prev[id],
      };
      if (onProgressChange) {
        onProgressChange(updated);
      }
      return updated;
    });
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => completedIds[s.id]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const headerTitle = contentType === 'personal'
    ? 'Actionable Reflections & Insights'
    : contentType === 'educational'
    ? 'Key Learning Milestones'
    : 'Actionable Implementation Checklist';

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header and Progress Bar */}
      <div className="space-y-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <CheckSquare className="h-4 w-4" />
            <span>{headerTitle}</span>
          </div>

          <div className="text-xs font-medium text-slate-300">
            Progress: <span className="text-indigo-400 font-semibold">{completedCount}</span> of {totalSteps} items ({progressPercent}%)
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = !!completedIds[step.id];

          return (
            <div
              key={step.id || idx}
              onClick={() => toggleStep(step.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer select-none ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Checkbox */}
                <div
                  className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-900 hover:border-indigo-400'
                  }`}
                >
                  {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Step {step.stepNumber || idx + 1}
                    </span>
                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>

                  <p
                    className={`text-xs leading-relaxed transition-colors ${
                      isDone ? 'line-through text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Terminal Command snippet only when command exists */}
                  {step.command && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 flex items-center justify-between bg-black/60 rounded-md px-3 py-2 border border-slate-800 font-mono text-xs"
                    >
                      <div className="flex items-center space-x-2 overflow-x-auto text-indigo-300">
                        <Terminal className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <code className="select-all">{step.command}</code>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCommand(step.command!, step.id)}
                        className="ml-3 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 hover:text-white transition flex items-center space-x-1 shrink-0"
                        title="Copy command"
                      >
                        {copiedId === step.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
