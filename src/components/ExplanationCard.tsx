'use client';

import React from 'react';
import { TutorialExplanation } from '@/types';
import { BookOpen, Lightbulb, AlertTriangle, Layers, Quote, Sparkles } from 'lucide-react';

interface ExplanationCardProps {
  data: TutorialExplanation;
}

export function ExplanationCard({ data }: ExplanationCardProps) {
  const isPersonal = data.contentType === 'personal';
  const isEducational = data.contentType === 'educational';

  const sectionBadge = isPersonal
    ? 'Narrative Overview'
    : isEducational
    ? 'Concept Breakdown'
    : 'Tutorial Breakdown';

  const explanationTitle = isPersonal
    ? 'Context & Meaning'
    : isEducational
    ? 'Foundational Explanation'
    : 'Beginner-Friendly Explanation';

  const conceptsTitle = isPersonal
    ? 'Key Locations, People & Themes'
    : isEducational
    ? 'Essential Concepts & Terms'
    : 'Technical Concepts & Syntax';

  const tipsTitle = isPersonal
    ? 'Key Observations & Takeaways'
    : isEducational
    ? 'Important Nuances & Context'
    : 'Common Pitfalls & Troubleshooting';

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header with Title and Real Provider Badge */}
      <div className="space-y-4 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>{sectionBadge}</span>
          </div>

          {/* Honest Provider Status */}
          {data.isDemoMode ? (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{data.provider || 'Grounded Synthesizer (Demo Mode)'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{data.provider || 'viaSocket AI'}</span>
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          {data.title}
        </h2>

        {data.summary && (
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold block mb-1">Summary</strong>
            <p>{data.summary}</p>
          </div>
        )}
      </div>

      {/* Beginner-Friendly Explanation */}
      {data.beginnerExplanation && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Lightbulb className="h-4 w-4 text-indigo-400" />
            <span>{explanationTitle}</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 text-sm text-slate-200 leading-relaxed">
            {data.beginnerExplanation}
          </div>
        </div>
      )}

      {/* Important Concepts & Definitions */}
      {data.importantConcepts && data.importantConcepts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>{conceptsTitle}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.importantConcepts.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5"
              >
                <div className="text-xs font-bold text-indigo-300 font-mono">
                  {item.term}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {item.definition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations / Troubleshooting Tips */}
      {data.troubleshootingTips && data.troubleshootingTips.length > 0 && (
        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-slate-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{tipsTitle}</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-400 leading-relaxed">
            {data.troubleshootingTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Verified Source Excerpts */}
      {data.sourceExcerpts && data.sourceExcerpts.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-500 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            <Quote className="h-3 w-3" />
            <span>Grounded Source Excerpts</span>
          </div>
          <div className="space-y-1 italic pl-3 border-l-2 border-slate-800">
            {data.sourceExcerpts.map((excerpt, idx) => (
              <p key={idx}>&ldquo;{excerpt}&rdquo;</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
