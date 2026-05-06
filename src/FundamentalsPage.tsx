import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';
import { FUNDAMENTALS } from './fundamentals-questions';
import type { FundamentalsQuestion } from './fundamentals-questions';
import * as testLogger from './testLogger';

interface FundamentalsPageProps {
  onBack: () => void;
  onTakeFullTest: () => void;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

interface Level {
  minScore: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
}

const LEVELS: Level[] = [
  {
    minScore: 18,
    title: 'Strong Foundations',
    shortTitle: 'Strong',
    description: 'Excellent grasp of core marketing concepts. Your thinking is clear, your vocabulary is precise, and you understand how the pieces connect.',
    color: '#34c759',
  },
  {
    minScore: 14,
    title: 'Solid Fundamentals',
    shortTitle: 'Solid',
    description: 'Good command of the essentials with a few gaps. You think like a marketer — some concepts need more depth or application.',
    color: '#0071e3',
  },
  {
    minScore: 9,
    title: 'Developing',
    shortTitle: 'Developing',
    description: 'You have the broad shape but the detail is inconsistent. Focus on the concepts you missed — they\'re foundational to everything above them.',
    color: '#ff9500',
  },
  {
    minScore: 0,
    title: 'Building Foundations',
    shortTitle: 'Building',
    description: 'Marketing fundamentals are the first layer of any serious skill set. Start with the concepts here — they unlock everything else.',
    color: '#ff3b30',
  },
];

function getLevel(correct: number): Level {
  return LEVELS.find(l => correct >= l.minScore) ?? LEVELS[LEVELS.length - 1];
}

// ─── SHUFFLE HELPER ───────────────────────────────────────────────────────────

function shuffled(q: FundamentalsQuestion): FundamentalsQuestion & { origCorrect: number } {
  const perm = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return {
    ...q,
    options: perm.map(i => q.options[i]) as [string, string, string, string],
    correctIndex: perm.indexOf(q.correctIndex),
    origCorrect: q.correctIndex,
  };
}

// ─── SHARED TINY COMPONENTS ───────────────────────────────────────────────────

function NavBar({
  left,
  right,
  onLeft,
}: {
  left: string;
  right?: string;
  onLeft: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center h-11 px-5 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-[#e8e8ed]">
      <button
        onClick={onLeft}
        className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f] hover:opacity-60 transition-opacity cursor-pointer"
      >
        <ArrowLeft size={13} strokeWidth={1.8} />
        {left}
      </button>
      {right && <div className="ml-auto text-[12px] text-[#707070]">{right}</div>}
    </header>
  );
}

function ProgressLine({ pct }: { pct: number }) {
  return (
    <div className="h-[2px] bg-[#e8e8ed]">
      <div
        className="h-full bg-[#1d1d1f] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FundamentalsPage({ onBack, onTakeFullTest }: FundamentalsPageProps) {
  // Shuffle question order + option order once on mount
  const questions = useMemo(() => FUNDAMENTALS.map(shuffled), []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'quiz' | 'results'>('quiz');
  const [showExplanation, setShowExplanation] = useState(false);

  // ── Logging refs ──────────────────────────────────────────────────────────
  const sessionIdRef = useRef<string | null>(null);
  const questionShownAtRef = useRef<number>(Date.now());
  const resultLoggedRef = useRef(false);

  // Start a session on mount
  useEffect(() => {
    sessionIdRef.current = testLogger.startSession('fundamentals');
  }, []);

  // Reset question timer whenever the visible question changes
  useEffect(() => {
    questionShownAtRef.current = Date.now();
  }, [index]);

  // Complete the session once when results are first shown
  useEffect(() => {
    if (phase === 'results' && sessionIdRef.current && !resultLoggedRef.current) {
      resultLoggedRef.current = true;
      const scorePct = Math.round((correctCount / questions.length) * 100);
      testLogger.completeSession(sessionIdRef.current, {
        correctCount,
        totalCount: questions.length,
        scorePct,
        level: getLevel(correctCount).title,
      });
    }
  }, [phase, correctCount, questions.length]);

  const total = questions.length;
  const current = questions[index];
  const progressPct = (index / total) * 100;

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const correct = idx === current.correctIndex;
      if (correct) setCorrectCount(c => c + 1);
      setShowExplanation(true);

      // Log question attempt
      if (sessionIdRef.current) {
        testLogger.logQuestion(sessionIdRef.current, {
          questionId: current.id,
          concept: current.concept,
          difficulty: 'n/a',
          questionType: 'knowledge',
          questionText: current.question,
          selectedOptionText: current.options[idx],
          correctOptionText: current.options[current.correctIndex],
          correct,
          antiPattern: null,
          timeMs: Date.now() - questionShownAtRef.current,
        });
      }
    },
    [selected, current]
  );

  const handleNext = useCallback(() => {
    setSelected(null);
    setShowExplanation(false);
    if (index + 1 >= total) {
      setPhase('results');
    } else {
      setIndex(i => i + 1);
    }
  }, [index, total]);

  const handleRetake = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase('quiz');
    setShowExplanation(false);
    // Start a fresh session for the retake
    resultLoggedRef.current = false;
    sessionIdRef.current = testLogger.startSession('fundamentals');
    questionShownAtRef.current = Date.now();
  }, []);

  // ── RESULTS ──────────────────────────────────────────────────────────────

  if (phase === 'results') {
    const level = getLevel(correctCount);
    const scorePct = Math.round((correctCount / total) * 100);

    // Group missed questions by concept
    const missed = questions.filter((_, i) => {
      // We track by re-checking answers — but we don't store per-q results
      // So we can't show missed breakdown without that state. Keep it simple.
      return false; // placeholder — per-question tracking added below
    });

    return (
      <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
        {/* Nav */}
        <header className="sticky top-0 z-50 flex items-center h-11 px-5 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-[#e8e8ed]">
          <button
            onClick={handleRetake}
            className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f] hover:opacity-60 transition-opacity cursor-pointer"
          >
            <RotateCcw size={13} strokeWidth={1.8} /> Retake
          </button>
          <span className="mx-3 text-[#e8e8ed] select-none">|</span>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f] hover:opacity-60 transition-opacity cursor-pointer"
          >
            <ArrowLeft size={13} strokeWidth={1.8} /> Back
          </button>
          <div className="ml-auto text-[12px] text-[#707070]">Fundamentals Result</div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[660px] mx-auto px-5 py-14 flex flex-col gap-6">

            {/* Hero score */}
            <div className="text-center flex flex-col items-center gap-3 pb-6">
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070]">
                Fundamentals score
              </p>
              <div className="text-[96px] font-bold leading-[1.04] tracking-[-2.11px] text-[#1d1d1f]">
                {scorePct}
                <span className="text-[56px] font-semibold tracking-[-0.9px] text-[#707070]">%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: level.color }} />
                <span className="text-[24px] font-semibold tracking-[-0.36px] text-[#1d1d1f]">
                  {level.title}
                </span>
              </div>
              <p className="text-[17px] text-[#707070] leading-[1.47] tracking-[-0.1px] max-w-[480px]">
                {level.description}
              </p>
              <p className="text-[12px] text-[#707070] mt-1">
                {correctCount} correct · {total - correctCount} missed · {total} questions
              </p>
            </div>

            {/* ── Score bar ── */}
            <div className="bg-white rounded-[28px] px-7 py-6">
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-5">
                Score breakdown
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-[6px] rounded-full bg-[#e8e8ed] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${scorePct}%`, background: level.color }}
                  />
                </div>
                <span
                  className="text-[20px] font-bold tracking-[-0.2px] shrink-0"
                  style={{ color: level.color }}
                >
                  {correctCount}/{total}
                </span>
              </div>
              {/* Level thresholds */}
              <div className="mt-5 grid grid-cols-4 gap-2">
                {LEVELS.slice().reverse().map(l => (
                  <div key={l.title} className="text-center">
                    <div
                      className="w-full h-[3px] rounded-full mb-1.5"
                      style={{
                        background: correctCount >= l.minScore ? l.color : '#e8e8ed',
                      }}
                    />
                    <p className="text-[11px] font-medium" style={{ color: l.color }}>{l.shortTitle}</p>
                    <p className="text-[10px] text-[#707070]">≥{l.minScore}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Full test CTA ── */}
            <div className="bg-[#1d1d1f] rounded-[28px] p-7">
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-3">
                Want the full picture?
              </p>
              <h3 className="text-[24px] font-semibold tracking-[-0.36px] text-white mb-2">
                Get your complete marketing profile
              </h3>
              <p className="text-[15px] text-[#a1a1a6] leading-[1.47] tracking-[-0.1px] mb-6">
                The full assessment tests 77 elements across 13 domains — scope, depth, diagnostic reasoning, and executive judgement. You get a 4-layer score, a candidate profile, anti-pattern flags, and a personalised learning path.
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {[
                  '77 elements',
                  '13 domains',
                  'Candidate profile',
                  'Anti-pattern detection',
                  'Learning path',
                ].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-white/15 text-[12px] text-[#a1a1a6]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={onTakeFullTest}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#1d1d1f] rounded-full text-[15px] font-normal hover:bg-[#f5f5f7] transition-colors cursor-pointer"
              >
                Take the full assessment <ChevronRight size={14} strokeWidth={1.8} />
              </button>
            </div>

            {/* Retake */}
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#e8e8ed] bg-white text-[#1d1d1f] rounded-full text-[14px] font-normal hover:bg-[#f5f5f7] transition-colors cursor-pointer"
              >
                <RotateCcw size={13} strokeWidth={1.8} /> Retake fundamentals test
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ─────────────────────────────────────────────────────────────────

  if (!current) return null;

  const isAnswered = selected !== null;
  const isCorrect = selected === current.correctIndex;

  return (
    <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
      <NavBar
        left="Exit"
        right={`${index + 1} / ${total}`}
        onLeft={onBack}
      />
      <ProgressLine pct={progressPct} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[660px] mx-auto px-5 py-8 flex flex-col gap-5">

          {/* Concept chip */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#e8e8ed] text-[12px] text-[#474747]">
              {current.concept}
            </span>
            <span className="text-[12px] text-[#707070]">Fundamentals</span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-[28px] px-7 py-7">
            <p className="text-[24px] font-semibold leading-[1.29] tracking-[-0.36px] text-[#1d1d1f]">
              {current.question}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-[10px]">
            {current.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrectOpt = idx === current.correctIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className="w-full text-left bg-white rounded-[28px] border-2 transition-all duration-100"
                  style={{
                    borderColor: isAnswered
                      ? isCorrectOpt
                        ? '#34c759'
                        : isSelected
                        ? '#ff3b30'
                        : 'transparent'
                      : 'transparent',
                    backgroundColor: isAnswered
                      ? isCorrectOpt
                        ? 'rgba(52,199,89,0.06)'
                        : isSelected
                        ? 'rgba(255,59,48,0.06)'
                        : 'white'
                      : 'white',
                    opacity: isAnswered && !isCorrectOpt && !isSelected ? 0.35 : 1,
                    cursor: isAnswered ? 'default' : 'pointer',
                  }}
                >
                  <div className="flex items-start gap-4 px-7 py-5">
                    <span
                      className="text-[12px] font-semibold shrink-0 mt-[1px] w-4 text-center"
                      style={{
                        color: isAnswered
                          ? isCorrectOpt
                            ? '#34c759'
                            : isSelected
                            ? '#ff3b30'
                            : '#e8e8ed'
                          : '#707070',
                      }}
                    >
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span
                      className="text-[17px] leading-[1.47] tracking-[-0.1px]"
                      style={{
                        color: isAnswered
                          ? isCorrectOpt
                            ? '#1d7a45'
                            : isSelected
                            ? '#c0392b'
                            : '#707070'
                          : '#1d1d1f',
                      }}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation + Next */}
          {showExplanation && (
            <div className="flex flex-col gap-3">
              <div
                className="rounded-[20px] px-6 py-4"
                style={{
                  background: isCorrect ? 'rgba(52,199,89,0.07)' : 'rgba(255,59,48,0.06)',
                  borderLeft: `3px solid ${isCorrect ? '#34c759' : '#ff3b30'}`,
                }}
              >
                <p
                  className="text-[12px] font-semibold tracking-[0.04em] uppercase mb-1.5"
                  style={{ color: isCorrect ? '#1d7a45' : '#c0392b' }}
                >
                  {isCorrect ? 'Correct' : 'Not quite'}
                </p>
                <p className="text-[14px] text-[#1d1d1f] leading-[1.5] tracking-[-0.04px]">
                  {current.explanation}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#0071e3] text-white rounded-full text-[17px] font-normal hover:bg-[#0077ed] transition-colors cursor-pointer"
              >
                {index + 1 >= total ? 'See results' : 'Next question'}
                <ChevronRight size={15} strokeWidth={1.8} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
