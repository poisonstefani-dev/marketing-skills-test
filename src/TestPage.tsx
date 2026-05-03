import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { QUIZ_ELEMENTS, QUIZ_RESULTS } from './quiz-data';
import type { QuizElement, QuizQuestion } from './quiz-data';
import { CASE_BLOCKS } from './quiz-cases';
import type { CaseBlock } from './quiz-cases';
import { COLORS } from './data';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type QuestionType = 'knowledge' | 'applied' | 'diagnostic' | 'systems' | 'executive';

interface QuestionRecord {
  elementId: string;
  categoryId: string;
  domain: string;
  questionType: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  correct: boolean;
  antiPattern?: string | null;
}

// ─── DOMAIN MAP ───────────────────────────────────────────────────────────────
// Safety fallback — quiz-content.json is the live source; these are never hit in normal operation

const DOMAIN_MAP: Record<string, string> = {
  jtbd: 'Strategy & Market Thinking', rfm: 'Strategy & Market Thinking',
  sales_playbook: 'Strategy & Market Thinking', storybrand: 'Strategy & Market Thinking',
  'anchor-pricing': 'Strategy & Market Thinking', icp: 'Strategy & Market Thinking',
  'value-prop': 'Strategy & Market Thinking',
  ahrefs: 'SEO & Search', 'search-intent': 'SEO & Search', 'quality-score': 'SEO & Search',
  rlsa: 'SEO & Search', pmax: 'SEO & Search', app_keywords: 'SEO & Search',
  wordpress: 'Content & Brand Communication', davinci: 'Content & Brand Communication',
  substack_pub: 'Content & Brand Communication', figma_brand: 'Content & Brand Communication',
  grammarly: 'Content & Brand Communication', linkedin_tl: 'Content & Brand Communication',
  'content-distribution': 'Content & Brand Communication', 'video-ads': 'Content & Brand Communication',
  ga4: 'Analytics & Experimentation', mixpanel: 'Analytics & Experimentation',
  optimizely_cro: 'Analytics & Experimentation', 'pie-scoring': 'Analytics & Experimentation',
  'retention-cohorts': 'Analytics & Experimentation', 'social-proof': 'Analytics & Experimentation',
  google_ads_p: 'Paid Media', meta_ads: 'Paid Media', meta_pixel: 'Paid Media', meta_adv: 'Paid Media',
  discord: 'Community & Advocacy', points_sys: 'Community & Advocacy',
  friendbuy: 'Community & Advocacy', aspireiq: 'Community & Advocacy',
  static_bill: 'Physical & Experiential', brand_act: 'Physical & Experiential',
  unboxing_des: 'Physical & Experiential',
  appcues: 'Product Growth & PLG', posthog: 'Product Growth & PLG',
  network_effects: 'Product Growth & PLG', aarrr: 'Product Growth & PLG',
  k_factor: 'Product Growth & PLG', ice_scoring: 'Product Growth & PLG', freemium: 'Product Growth & PLG',
  klaviyo: 'Lifecycle & Customer Success', klaviyo_sms: 'Lifecycle & Customer Success',
  braze_ret: 'Lifecycle & Customer Success', gainsight: 'Lifecycle & Customer Success',
  winback_series: 'Lifecycle & Customer Success', 'health-scoring': 'Lifecycle & Customer Success',
  'email-deliverability': 'Lifecycle & Customer Success',
  branch: 'Mobile Growth', appsflyer_attr: 'Mobile Growth',
  muck_rack: 'Earned Media & Analyst Relations', press_pitch: 'Earned Media & Analyst Relations',
  gartner: 'Earned Media & Analyst Relations', 'dark-social': 'Earned Media & Analyst Relations',
  salesforce: 'Data, Privacy & AI', segment: 'Data, Privacy & AI', snowflake: 'Data, Privacy & AI',
  onetrust: 'Data, Privacy & AI', chatgpt: 'Data, Privacy & AI', dynamic_yield: 'Data, Privacy & AI',
  cart_recovery: 'Commerce & Revenue Ops', dynamic_pricing: 'Commerce & Revenue Ops',
  recharge: 'Commerce & Revenue Ops', sixsense_dg: 'Commerce & Revenue Ops',
  bombora_dg: 'Commerce & Revenue Ops', highspot: 'Commerce & Revenue Ops',
  'tofu-mofu-bofu': 'Commerce & Revenue Ops', 'pipeline-acceleration': 'Commerce & Revenue Ops',
  'expansion-mrr': 'Commerce & Revenue Ops', 'lead-scoring': 'Commerce & Revenue Ops',
  nrr: 'Commerce & Revenue Ops', abm: 'Commerce & Revenue Ops',
};

const HARD_TYPE_MAP: Record<string, QuestionType> = {
  jtbd: 'systems', rfm: 'executive', sales_playbook: 'executive',
  ahrefs: 'diagnostic', klaviyo: 'diagnostic', salesforce: 'diagnostic',
  wordpress: 'executive', davinci: 'executive', substack_pub: 'executive',
  ga4: 'diagnostic', mixpanel: 'executive', optimizely_cro: 'diagnostic',
  figma_brand: 'executive', muck_rack: 'executive', grammarly: 'executive',
  klaviyo_sms: 'systems', aspireiq: 'diagnostic', tiktok_search: 'diagnostic',
  google_ads_p: 'diagnostic', meta_ads: 'diagnostic', meta_pixel: 'executive',
  discord: 'diagnostic', points_sys: 'diagnostic', friendbuy: 'systems',
  static_bill: 'executive', brand_act: 'diagnostic', unboxing_des: 'systems',
  appcues: 'executive', posthog: 'diagnostic', network_effects: 'systems',
  braze_ret: 'executive', gainsight: 'diagnostic', winback_series: 'executive',
  branch: 'diagnostic', appsflyer_attr: 'executive', app_keywords: 'executive',
  press_pitch: 'executive', linkedin_tl: 'executive', gartner: 'executive',
  aarrr: 'systems', k_factor: 'diagnostic', ice_scoring: 'diagnostic',
  segment: 'executive', snowflake: 'executive', onetrust: 'systems',
  chatgpt: 'executive', dynamic_yield: 'executive', meta_adv: 'systems',
  cart_recovery: 'executive', dynamic_pricing: 'systems', recharge: 'systems',
  sixsense_dg: 'diagnostic', bombora_dg: 'diagnostic', highspot: 'executive',
  'tofu-mofu-bofu': 'systems', 'search-intent': 'diagnostic', 'quality-score': 'executive',
  rlsa: 'executive', storybrand: 'applied', freemium: 'systems',
  'health-scoring': 'diagnostic', 'pie-scoring': 'diagnostic', 'anchor-pricing': 'executive',
  'pipeline-acceleration': 'executive', icp: 'diagnostic', 'email-deliverability': 'executive',
  'dark-social': 'diagnostic', 'expansion-mrr': 'executive', 'social-proof': 'executive',
  'lead-scoring': 'diagnostic', 'content-distribution': 'executive', nrr: 'executive',
  abm: 'executive', pmax: 'executive', 'retention-cohorts': 'systems',
  'value-prop': 'systems', 'video-ads': 'diagnostic',
};

function getQuestionType(elementId: string, difficulty: 'easy' | 'medium' | 'hard', q?: QuizQuestion): QuestionType {
  if ((q as any)?.questionType) return (q as any).questionType as QuestionType;
  if (difficulty === 'easy') return 'knowledge';
  if (difficulty === 'medium') return 'applied';
  return HARD_TYPE_MAP[elementId] ?? 'diagnostic';
}

function getDomain(elementId: string, element?: QuizElement): string {
  if ((element as any)?.domain) return (element as any).domain as string;
  return DOMAIN_MAP[elementId] ?? 'Other';
}

// ─── SCORING ──────────────────────────────────────────────────────────────────

interface CategoryScore {
  categoryId: string;
  categoryName: string;
  correct: number;
  total: number;
}

function buildInitialScores(elements: QuizElement[]): Record<string, CategoryScore> {
  const scores: Record<string, CategoryScore> = {};
  elements.forEach(el => {
    if (!scores[el.categoryId]) {
      scores[el.categoryId] = {
        categoryId: el.categoryId,
        categoryName: el.categoryName,
        correct: 0,
        total: 0,
      };
    }
    scores[el.categoryId].total += 3;
  });
  return scores;
}

function pct(arr: { correct: boolean }[]) {
  return arr.length > 0 ? Math.round((arr.filter(r => r.correct).length / arr.length) * 100) : 0;
}

function computeBreakdown(records: QuestionRecord[]) {
  const scopeRecords = records.filter(r => r.questionType === 'knowledge' || r.questionType === 'applied');
  const depthRecords = records.filter(r => r.difficulty === 'hard');
  const diagnosticRecords = records.filter(r => r.questionType === 'diagnostic' || r.questionType === 'systems');
  const judgementRecords = records.filter(r => r.questionType === 'executive');

  const scopeScore = pct(scopeRecords);
  const depthScore = pct(depthRecords);
  const diagnosticScore = pct(diagnosticRecords);
  const judgementScore = pct(judgementRecords);
  const overallScore = pct(records);

  const antiPatternCounts: Record<string, number> = {};
  records.filter(r => !r.correct && r.antiPattern).forEach(r => {
    if (r.antiPattern) antiPatternCounts[r.antiPattern] = (antiPatternCounts[r.antiPattern] || 0) + 1;
  });

  const domainMap: Record<string, { domain: string; correct: number; total: number }> = {};
  records.forEach(r => {
    if (!domainMap[r.domain]) domainMap[r.domain] = { domain: r.domain, correct: 0, total: 0 };
    domainMap[r.domain].total++;
    if (r.correct) domainMap[r.domain].correct++;
  });

  return { scopeScore, depthScore, diagnosticScore, judgementScore, overallScore, antiPatternCounts, domainMap };
}

// ─── LEVEL & PROFILE ─────────────────────────────────────────────────────────

function getLevel(overallScore: number) {
  return (
    QUIZ_RESULTS.find(l => overallScore >= l.min) ??
    QUIZ_RESULTS[QUIZ_RESULTS.length - 1]
  );
}

const PROFILES: Record<string, { name: string; pattern: string; strength: string; risk: string }> = {
  't-shaped': {
    name: 'T-Shaped Strategic Operator',
    pattern: 'High breadth + 2-3 domain spikes + strong executive judgement',
    strength: 'Diagnoses root causes, prioritises under constraints, connects decisions to business economics.',
    risk: 'May have uneven depth across all 13 domains.',
  },
  'full-stack': {
    name: 'Full-Stack Marketer',
    pattern: 'Strong applied across domains + strong diagnostic',
    strength: 'Connects channels, product, analytics and revenue. Solid across the system.',
    risk: 'May lack 2-3 genuine deep spikes for specialist or GM-track roles.',
  },
  'surface-generalist': {
    name: 'Surface Generalist',
    pattern: 'Good scope score, weak depth and systems questions',
    strength: 'Knows a lot about everything — good breadth and term recognition.',
    risk: 'Solves by pattern-matching rather than diagnosis. Misses cross-system causes.',
  },
  'tool-junior': {
    name: 'Tool-Aware Marketer',
    pattern: 'High knowledge/easy score, low diagnostic and systems',
    strength: 'Recognises platforms and frameworks well.',
    risk: 'Knowledge stays at the surface. May appear broader than the diagnostic depth actually is.',
  },
  'channel-specialist': {
    name: 'Channel Specialist',
    pattern: 'Deep in 1-2 domains, low breadth elsewhere',
    strength: 'Genuine depth in their zone — strong execution and judgment within it.',
    risk: 'May miss systemic causes that cross channel/function boundaries.',
  },
};

function detectProfile(
  scopeScore: number,
  depthScore: number,
  diagnosticScore: number,
  judgementScore: number,
  overallScore: number,
  domainMap: Record<string, { correct: number; total: number }>
): string {
  if (overallScore >= 86) return 't-shaped';
  if (overallScore >= 71) return 'full-stack';
  const domainPcts = Object.values(domainMap).filter(d => d.total >= 2).map(d => d.correct / d.total);
  const highDomains = domainPcts.filter(p => p >= 0.75).length;
  const lowDomains = domainPcts.filter(p => p < 0.4).length;
  if (highDomains >= 2 && lowDomains >= domainPcts.length * 0.6) return 'channel-specialist';
  if (scopeScore >= 55 && depthScore < 45) return 'surface-generalist';
  if (scopeScore >= 60 && diagnosticScore < 35) return 'tool-junior';
  return 'surface-generalist';
}

const ANTI_PATTERN_META: Record<string, { label: string; desc: string }> = {
  budget_bias: { label: 'Budget Bias', desc: 'Defaults to spending more before diagnosing the actual problem.' },
  tool_solution_bias: { label: 'Tool Bias', desc: 'Proposes switching platforms instead of fixing the process or model.' },
  volume_bias: { label: 'Volume Bias', desc: 'Confuses output (more content, more leads, more posts) with outcome.' },
  discount_bias: { label: 'Discount Bias', desc: 'Reaches for discounts to fix retention or conversion problems.' },
  attribution_naivety: { label: 'Attribution Naivety', desc: 'Accepts platform-reported ROAS without checking incremental impact.' },
  acquisition_fixation: { label: 'Acquisition Fixation', desc: 'Pours traffic into a broken activation or retention system.' },
  brand_vagueness: { label: 'Brand Vagueness', desc: 'Chooses awareness without connecting it to consideration or purchase triggers.' },
};

// ─── SHUFFLE ─────────────────────────────────────────────────────────────────

function shuffleQuestion(q: QuizQuestion): QuizQuestion {
  const perm = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const antiPatterns = (q as any).antiPatterns as (string | null)[] | undefined;
  return {
    ...q,
    options: perm.map(i => q.options[i]),
    correctIndex: perm.indexOf(q.correctIndex),
    ...(antiPatterns ? { antiPatterns: perm.map(i => antiPatterns[i]) } : {}),
  } as QuizQuestion;
}

interface TestPageProps {
  onBack: () => void;
}

// ─── RADAR CHART ─────────────────────────────────────────────────────────────

interface RadarChartProps {
  scores: Record<string, CategoryScore>;
}

function RadarChart({ scores }: RadarChartProps) {
  const categoryList = Object.values(scores) as CategoryScore[];
  const n = categoryList.length;
  if (n === 0) return null;

  const cx = 300, cy = 300, r = 220;
  const rings = [0.25, 0.5, 0.75, 1.0];
  const angles = categoryList.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);
  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });
  const polygonPoints = categoryList.map((cat, i) => {
    const p = cat.total > 0 ? cat.correct / cat.total : 0;
    const pt = toXY(angles[i], r * p);
    return `${pt.x},${pt.y}`;
  }).join(' ');
  const labelRadius = r + 34;

  return (
    <svg viewBox="0 0 600 600" className="w-full max-w-[520px] mx-auto">
      {rings.map(ring => {
        const ringPoints = categoryList.map((_, i) => {
          const pt = toXY(angles[i], r * ring);
          return `${pt.x},${pt.y}`;
        }).join(' ');
        return (
          <polygon key={ring} points={ringPoints} fill="none" stroke="#e8e8ed"
            strokeWidth={ring === 1.0 ? 1.5 : 0.8} strokeDasharray={ring < 1.0 ? '4 3' : undefined} />
        );
      })}
      {categoryList.map((_, i) => {
        const end = toXY(angles[i], r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e8e8ed" strokeWidth={0.8} />;
      })}
      <polygon points={polygonPoints} fill="#1d1d1f" fillOpacity={0.08} stroke="#1d1d1f" strokeWidth={1.5} strokeLinejoin="round" />
      {categoryList.map((cat, i) => {
        const p = cat.total > 0 ? cat.correct / cat.total : 0;
        const pt = toXY(angles[i], r * p);
        const color = COLORS[cat.categoryId] ?? '#1d1d1f';
        return <circle key={cat.categoryId} cx={pt.x} cy={pt.y} r={4.5} fill={color} stroke="white" strokeWidth={1.5} />;
      })}
      {rings.map(ring => {
        const pt = toXY(-Math.PI / 2, r * ring);
        return (
          <text key={ring} x={pt.x + 5} y={pt.y - 4} fontSize={9} fill="#707070"
            fontFamily="Inter, system-ui, sans-serif">{Math.round(ring * 100)}%</text>
        );
      })}
      {categoryList.map((cat, i) => {
        const pt = toXY(angles[i], labelRadius);
        const angle = angles[i];
        const isRight = Math.cos(angle) > 0.1;
        const isLeft = Math.cos(angle) < -0.1;
        const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
        const color = COLORS[cat.categoryId] ?? '#1d1d1f';
        const p = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
        const shortName = cat.categoryName
          .replace('Product Growth', 'Product\nGrowth')
          .replace('Earned Media', 'Earned\nMedia')
          .replace('AI Marketing', 'AI\nMarketing');
        return (
          <g key={cat.categoryId}>
            <text x={pt.x} y={pt.y} fontSize={9.5} fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif" textAnchor={textAnchor} fill={color}>
              {shortName.includes('\n') ? (
                shortName.split('\n').map((line, li) => (
                  <tspan key={li} x={pt.x} dy={li === 0 ? 0 : 12}>{line}</tspan>
                ))
              ) : shortName}
            </text>
            <text x={pt.x} y={pt.y + (shortName.includes('\n') ? 22 : 11)}
              fontSize={9} fontFamily="'IBM Plex Mono', monospace" textAnchor={textAnchor} fill="#707070">
              {p}%
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="#1d1d1f" opacity={0.2} />
    </svg>
  );
}

// ─── SCORE BAR ───────────────────────────────────────────────────────────────

function ScoreBar({ label, score, sublabel, color = '#1d1d1f' }: {
  label: string; score: number; sublabel: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 shrink-0">
        <div className="text-[14px] font-medium text-[#1d1d1f]">{label}</div>
        <div className="text-[12px] text-[#707070] mt-0.5 tracking-[-0.1px]">{sublabel}</div>
      </div>
      <div className="flex-1 h-[3px] rounded-full bg-[#e8e8ed] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <div className="w-10 text-right text-[14px] font-semibold shrink-0 tracking-[-0.1px]" style={{ color }}>
        {score}%
      </div>
    </div>
  );
}

// ─── CHIP ─────────────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-[10px] py-[3px] rounded-full border border-[#e8e8ed] text-[12px] text-[#474747] leading-[1.4]">
      {label}
    </span>
  );
}

// ─── NAV HEADER ──────────────────────────────────────────────────────────────

function NavBar({ left, right, onLeft }: { left: string; right?: string; onLeft: () => void }) {
  return (
    <header className="sticky top-0 z-50 flex items-center h-11 px-5 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-[#e8e8ed]">
      <button
        onClick={onLeft}
        className="flex items-center gap-1.5 text-[12px] font-normal text-[#1d1d1f] hover:opacity-60 transition-opacity cursor-pointer"
      >
        <ArrowLeft size={13} strokeWidth={1.8} />
        {left}
      </button>
      {right && (
        <div className="ml-auto text-[12px] text-[#707070]">{right}</div>
      )}
    </header>
  );
}

// ─── THIN PROGRESS LINE ───────────────────────────────────────────────────────

function ProgressLine({ pct: value, color = '#1d1d1f' }: { pct: number; color?: string }) {
  return (
    <div className="h-[2px] bg-[#e8e8ed]">
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

type Phase = 'intro' | 'question' | 'feedback' | 'cases-intro' | 'case-question' | 'case-feedback' | 'results';

export default function TestPage({ onBack }: TestPageProps) {
  const shuffledElements = useMemo(() => {
    const arr = QUIZ_ELEMENTS.map(el => ({
      ...el,
      questions: el.questions.map(shuffleQuestion) as [QuizQuestion, QuizQuestion, QuizQuestion],
    }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const [phase, setPhase] = useState<Phase>('intro');
  const [elementIndex, setElementIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, CategoryScore>>(() =>
    buildInitialScores(shuffledElements)
  );
  const [records, setRecords] = useState<QuestionRecord[]>([]);
  const [caseIndex, setCaseIndex] = useState(0);
  const [caseQIndex, setCaseQIndex] = useState(0);

  const totalElements = shuffledElements.length;
  const currentElement = shuffledElements[elementIndex] ?? null;
  const currentQuestion = currentElement?.questions[questionIndex] ?? null;
  const progressPct = totalElements > 0 ? (elementIndex / totalElements) * 100 : 0;

  const startQuiz = useCallback(() => {
    setPhase('question');
    setElementIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setScores(buildInitialScores(shuffledElements));
    setRecords([]);
    setCaseIndex(0);
    setCaseQIndex(0);
  }, [shuffledElements]);

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null || !currentQuestion || !currentElement) return;
    const correct = idx === currentQuestion.correctIndex;
    setSelected(idx);

    if (correct) {
      setScores(prev => ({
        ...prev,
        [currentElement.categoryId]: {
          ...prev[currentElement.categoryId],
          correct: prev[currentElement.categoryId].correct + 1,
        },
      }));
    }

    const qType = getQuestionType(currentElement.id, currentQuestion.difficulty, currentQuestion);
    const antiPatterns = (currentQuestion as any).antiPatterns as (string | null)[] | undefined;
    const antiPattern = !correct ? (antiPatterns?.[idx] ?? null) : null;
    setRecords(prev => [...prev, {
      elementId: currentElement.id,
      categoryId: currentElement.categoryId,
      domain: getDomain(currentElement.id, currentElement),
      questionType: qType,
      difficulty: currentQuestion.difficulty,
      correct,
      antiPattern,
    }]);

    setTimeout(() => {
      setSelected(null);
      if (correct && questionIndex < 2) {
        setQuestionIndex(questionIndex + 1);
        setPhase('question');
      } else {
        const nextEl = elementIndex + 1;
        if (nextEl >= totalElements) {
          setPhase('cases-intro');
        } else {
          setElementIndex(nextEl);
          setQuestionIndex(0);
          setPhase('question');
        }
      }
    }, 900);

    setPhase('feedback');
  }, [selected, currentQuestion, currentElement, questionIndex, elementIndex, totalElements]);

  const resetQuiz = useCallback(() => {
    setPhase('intro');
    setElementIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setScores(buildInitialScores(shuffledElements));
    setRecords([]);
    setCaseIndex(0);
    setCaseQIndex(0);
  }, [shuffledElements]);

  // ── RESULTS ──────────────────────────────────────────────────────────────

  if (phase === 'results') {
    const { scopeScore, depthScore, diagnosticScore, judgementScore, overallScore, antiPatternCounts, domainMap } =
      computeBreakdown(records);
    const level = getLevel(overallScore);
    const profileKey = detectProfile(scopeScore, depthScore, diagnosticScore, judgementScore, overallScore, domainMap);
    const profile = PROFILES[profileKey];
    const topAntiPatterns = Object.entries(antiPatternCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([, c]) => c >= 1);
    const categoryList = Object.values(scores) as CategoryScore[];
    const sortedDomains = Object.values(domainMap)
      .filter(d => d.total > 0).sort((a, b) => (b.correct / b.total) - (a.correct / a.total));
    const weakDomains = [...sortedDomains].reverse().slice(0, 3);

    return (
      <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">

        {/* Nav */}
        <header className="sticky top-0 z-50 flex items-center h-11 px-5 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-[#e8e8ed]">
          <button onClick={resetQuiz}
            className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f] hover:opacity-60 transition-opacity cursor-pointer">
            <RotateCcw size={13} strokeWidth={1.8} /> Retake
          </button>
          <span className="mx-3 text-[#e8e8ed] select-none">|</span>
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f] hover:opacity-60 transition-opacity cursor-pointer">
            <ArrowLeft size={13} strokeWidth={1.8} /> Back
          </button>
          <div className="ml-auto text-[12px] text-[#707070]">Marketing Assessment</div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[860px] mx-auto px-5 py-16 flex flex-col gap-6">

            {/* ── Hero score ── */}
            <div className="text-center flex flex-col items-center gap-3 pb-8">
              <p className="text-[12px] font-medium tracking-[0.04em] uppercase text-[#707070]">
                Overall score
              </p>
              <div className="text-[96px] font-bold leading-[1.04] tracking-[-2.11px] text-[#1d1d1f]">
                {overallScore}
                <span className="text-[56px] font-semibold tracking-[-0.9px] text-[#707070]">%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: level.color }} />
                <span className="text-[28px] font-semibold tracking-[-0.36px] text-[#1d1d1f]">{level.title}</span>
              </div>
              <p className="text-[17px] text-[#707070] leading-[1.47] tracking-[-0.1px] max-w-[520px]">
                {level.description}
              </p>
              <p className="text-[12px] text-[#707070] mt-1">
                {records.filter(r => r.correct).length} correct · {records.length} answered
              </p>
            </div>

            {/* ── 4-layer breakdown ── */}
            <div className="bg-white rounded-[28px] p-7">
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-6">
                Score breakdown
              </p>
              <div className="flex flex-col gap-5">
                <ScoreBar label="Scope" sublabel="knowledge + applied" score={scopeScore} color="#0071e3" />
                <ScoreBar label="Depth" sublabel="hard questions" score={depthScore} color="#5856d6" />
                <ScoreBar label="Diagnostic" sublabel="root cause thinking" score={diagnosticScore} color="#34c759" />
                <ScoreBar label="Judgement" sublabel="prioritisation questions" score={judgementScore} color="#ff9500" />
              </div>
              <div className="mt-6 pt-5 border-t border-[#e8e8ed] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Scope', hint: 'Marketing breadth' },
                  { label: 'Depth', hint: 'T-shaped zones' },
                  { label: 'Diagnostic', hint: 'Root cause thinking' },
                  { label: 'Judgement', hint: 'Decisions under constraints' },
                ].map(({ label, hint }) => (
                  <div key={label}>
                    <p className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#474747]">{label}</p>
                    <p className="text-[11px] text-[#707070] mt-0.5">{hint}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Candidate profile ── */}
            <div className="bg-white rounded-[28px] p-7">
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-4">
                Thinking profile
              </p>
              <p className="text-[24px] font-semibold tracking-[-0.36px] text-[#1d1d1f]">{profile.name}</p>
              <p className="text-[14px] text-[#707070] tracking-[-0.04px] mt-1 mb-5 font-mono">{profile.pattern}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-[#f5f5f7] rounded-[20px] p-5">
                  <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#34c759] mb-2">Strength</p>
                  <p className="text-[14px] text-[#1d1d1f] leading-[1.43] tracking-[-0.04px]">{profile.strength}</p>
                </div>
                <div className="bg-[#f5f5f7] rounded-[20px] p-5">
                  <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#ff9500] mb-2">Watch out for</p>
                  <p className="text-[14px] text-[#1d1d1f] leading-[1.43] tracking-[-0.04px]">{profile.risk}</p>
                </div>
              </div>
            </div>

            {/* ── Anti-patterns ── */}
            {topAntiPatterns.length > 0 && (
              <div className="bg-white rounded-[28px] p-7">
                <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-5">
                  Thinking patterns to watch
                </p>
                <div className="flex flex-col gap-4">
                  {topAntiPatterns.map(([key, count]) => {
                    const meta = ANTI_PATTERN_META[key];
                    if (!meta) return null;
                    return (
                      <div key={key} className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] mt-[5px] shrink-0" />
                        <div>
                          <p className="text-[14px] font-medium text-[#1d1d1f]">
                            {meta.label}
                            <span className="ml-2 text-[12px] font-normal text-[#707070]">{count}× appeared</span>
                          </p>
                          <p className="text-[13px] text-[#707070] mt-0.5 leading-[1.43]">{meta.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Domain breakdown ── */}
            <div>
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-3">
                Domain breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortedDomains.map(d => {
                  const p = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                  const barColor = p >= 75 ? '#34c759' : p >= 50 ? '#0071e3' : p >= 30 ? '#ff9500' : '#ff3b30';
                  return (
                    <div key={d.domain} className="flex items-center gap-4 bg-white rounded-[28px] px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1d1d1f] tracking-[-0.04px] truncate">{d.domain}</p>
                        <div className="mt-2 h-[3px] rounded-full bg-[#e8e8ed] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p}%`, background: barColor }} />
                        </div>
                      </div>
                      <p className="text-[14px] font-semibold shrink-0 tracking-[-0.04px]" style={{ color: barColor }}>
                        {p}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Focus areas ── */}
            {weakDomains.length > 0 && (
              <div className="bg-white rounded-[28px] p-7">
                <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-4">
                  Recommended focus areas
                </p>
                <div className="flex flex-col gap-3">
                  {weakDomains.map((d, i) => {
                    const p = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                    return (
                      <div key={d.domain} className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-[#707070] w-5 text-center shrink-0">{i + 1}</span>
                        <p className="text-[14px] font-medium text-[#1d1d1f] tracking-[-0.04px] flex-1">{d.domain}</p>
                        <p className="text-[13px] text-[#ff3b30] shrink-0">{p}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Strategic next step ── */}
            {level.learningPath && (
              <div className="bg-white rounded-[28px] p-7">
                <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-3">
                  Strategic next step
                </p>
                <p className="text-[17px] text-[#1d1d1f] leading-[1.47] tracking-[-0.1px]">{level.learningPath}</p>
              </div>
            )}

            {/* ── Radar chart ── */}
            <div className="bg-white rounded-[28px] p-7">
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-5 text-center">
                Score by category
              </p>
              <RadarChart scores={scores} />
            </div>

            {/* ── Category breakdown ── */}
            <div>
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-3">
                Category breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...categoryList].sort((a, b) => (b.correct / b.total) - (a.correct / a.total)).map(cat => {
                  const p = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
                  const color = COLORS[cat.categoryId] ?? '#1d1d1f';
                  return (
                    <div key={cat.categoryId} className="flex items-center gap-4 bg-white rounded-[28px] px-6 py-4">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1d1d1f] tracking-[-0.04px]">{cat.categoryName}</p>
                        <div className="mt-1.5 h-[3px] rounded-full bg-[#e8e8ed] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
                        </div>
                      </div>
                      <p className="text-[14px] font-semibold shrink-0 tracking-[-0.04px]" style={{ color }}>{p}%</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Retake ── */}
            <div className="flex justify-center pt-4 pb-6">
              <button onClick={resetQuiz}
                className="flex items-center gap-2 px-[22px] py-[11px] bg-[#0071e3] text-white rounded-full text-[17px] font-normal hover:bg-[#0077ed] transition-colors cursor-pointer">
                <RotateCcw size={15} strokeWidth={1.8} /> Retake assessment
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── CASE BLOCKS ──────────────────────────────────────────────────────────

  const currentCase: CaseBlock | null = CASE_BLOCKS[caseIndex] ?? null;
  const currentCaseQuestion = currentCase?.questions[caseQIndex] ?? null;
  const caseProgressPct = ((caseIndex * 3 + caseQIndex) / (CASE_BLOCKS.length * 3)) * 100;

  const handleCaseAnswer = useCallback((idx: number) => {
    if (selected !== null || !currentCase || !currentCaseQuestion) return;
    const correct = idx === currentCaseQuestion.correctIndex;
    setSelected(idx);

    currentCaseQuestion.linkedElementIds.forEach(elId => {
      const el = QUIZ_ELEMENTS.find(e => e.id === elId);
      if (!el) return;
      setRecords(prev => [...prev, {
        elementId: elId,
        categoryId: el.categoryId,
        domain: currentCaseQuestion.linkedDomain,
        questionType: currentCaseQuestion.questionType,
        difficulty: 'hard',
        correct,
        antiPattern: !correct ? (currentCaseQuestion.antiPatterns[idx] ?? null) : null,
      }]);
      if (correct) {
        setScores(prev => ({
          ...prev,
          [el.categoryId]: {
            ...prev[el.categoryId],
            correct: (prev[el.categoryId]?.correct ?? 0) + 1,
          },
        }));
      }
    });

    setTimeout(() => {
      setSelected(null);
      const nextQ = caseQIndex + 1;
      if (nextQ < 3) {
        setCaseQIndex(nextQ);
        setPhase('case-question');
      } else {
        const nextCase = caseIndex + 1;
        if (nextCase >= CASE_BLOCKS.length) {
          setPhase('results');
        } else {
          setCaseIndex(nextCase);
          setCaseQIndex(0);
          setPhase('cases-intro');
        }
      }
    }, 900);

    setPhase('case-feedback');
  }, [selected, currentCase, currentCaseQuestion, caseQIndex, caseIndex]);

  // ── CASES INTRO ────────────────────────────────────────────────────────────

  if (phase === 'cases-intro' && currentCase) {
    const isFirst = caseIndex === 0 && caseQIndex === 0;
    return (
      <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
        <NavBar left="Exit" right={`Scenario ${caseIndex + 1} of ${CASE_BLOCKS.length}`} onLeft={onBack} />
        <ProgressLine pct={caseProgressPct} color="#5856d6" />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[620px] mx-auto px-5 py-12 flex flex-col gap-6">

            {isFirst && (
              <div className="bg-white rounded-[28px] p-7">
                <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#5856d6] mb-2">
                  Core quiz complete
                </p>
                <p className="text-[17px] text-[#1d1d1f] leading-[1.47] tracking-[-0.1px]">
                  Now 5 real-world scenarios. Each tests diagnostic reasoning, systems thinking, and business judgement across multiple domains simultaneously.
                </p>
              </div>
            )}

            <div>
              <p className="text-[12px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-2">
                Scenario {currentCase.number} of {CASE_BLOCKS.length}
              </p>
              <h2 className="text-[40px] font-bold leading-[1.17] tracking-[-0.6px] text-[#1d1d1f]">
                {currentCase.title}
              </h2>
            </div>

            <p className="text-[17px] text-[#474747] leading-[1.47] tracking-[-0.1px]">
              {currentCase.scenario}
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-2">
              {currentCase.metrics.map(m => (
                <div key={m.label} className="bg-white rounded-[28px] px-6 py-5">
                  <p className="text-[11px] font-semibold tracking-[0.04em] uppercase text-[#707070] mb-1">{m.label}</p>
                  <p
                    className="text-[20px] font-semibold tracking-[-0.2px]"
                    style={{
                      color: m.direction === 'up' ? '#34c759'
                        : m.direction === 'down' ? '#ff3b30'
                        : '#1d1d1f',
                    }}
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Domain tags */}
            <div className="flex flex-wrap gap-2">
              {currentCase.linkedDomains.map(d => <Chip key={d} label={d} />)}
            </div>

            <button
              onClick={() => setPhase('case-question')}
              className="flex items-center justify-center gap-2 w-full py-[13px] bg-[#0071e3] text-white rounded-full text-[17px] font-normal hover:bg-[#0077ed] transition-colors cursor-pointer mt-2"
            >
              Begin scenario
            </button>

            <p className="text-[12px] text-[#707070] text-center -mt-2">
              3 questions · diagnostic, systems & judgement
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── CASE QUESTION / FEEDBACK ───────────────────────────────────────────────

  if ((phase === 'case-question' || phase === 'case-feedback') && currentCase && currentCaseQuestion) {
    const qTypeLabel: Record<string, string> = {
      diagnostic: 'Diagnostic', systems: 'Systems', executive: 'Judgement',
    };
    return (
      <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
        <NavBar
          left="Exit"
          right={`Case ${caseIndex + 1} · Q${caseQIndex + 1} / 3`}
          onLeft={onBack}
        />
        <ProgressLine pct={caseProgressPct} color="#5856d6" />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[660px] mx-auto px-5 py-10 flex flex-col gap-5">

            {/* Meta chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Chip label={`Case ${currentCase.number}`} />
              <span className="text-[12px] text-[#e8e8ed]">·</span>
              <span className="text-[12px] font-medium text-[#1d1d1f]">{currentCase.title}</span>
              <Chip label={qTypeLabel[currentCaseQuestion.questionType] ?? currentCaseQuestion.questionType} />
            </div>

            {/* Scenario reminder */}
            <div className="bg-[#f5f5f7] rounded-[20px] px-6 py-4 border border-[#e8e8ed]">
              <p className="text-[13px] text-[#707070] leading-[1.43] line-clamp-3">
                {currentCase.scenario}
              </p>
            </div>

            {/* Question */}
            <div className="bg-white rounded-[28px] px-7 py-6">
              <p className="text-[24px] font-semibold leading-[1.29] tracking-[-0.36px] text-[#1d1d1f]">
                {currentCaseQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-[10px]">
              {currentCaseQuestion.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === currentCaseQuestion.correctIndex;
                const isRevealing = phase === 'case-feedback';
                return (
                  <button
                    key={idx}
                    onClick={() => handleCaseAnswer(idx)}
                    disabled={phase === 'case-feedback'}
                    className="w-full text-left bg-white rounded-[28px] border-2 transition-all duration-100"
                    style={{
                      borderColor: isRevealing
                        ? isCorrect ? '#34c759' : isSelected ? '#ff3b30' : 'transparent'
                        : 'transparent',
                      backgroundColor: isRevealing
                        ? isCorrect ? 'rgba(52,199,89,0.06)' : isSelected ? 'rgba(255,59,48,0.06)' : 'white'
                        : 'white',
                      opacity: isRevealing && !isCorrect && !isSelected ? 0.35 : 1,
                      cursor: phase === 'case-feedback' ? 'default' : 'pointer',
                    }}
                  >
                    <div className="flex items-start gap-4 px-7 py-5">
                      <span
                        className="text-[12px] font-semibold shrink-0 mt-[1px] w-4 text-center"
                        style={{
                          color: isRevealing
                            ? isCorrect ? '#34c759' : isSelected ? '#ff3b30' : '#e8e8ed'
                            : '#707070',
                        }}
                      >
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span
                        className="text-[17px] leading-[1.47] tracking-[-0.1px]"
                        style={{ color: isRevealing ? (isCorrect ? '#1d7a45' : isSelected ? '#c0392b' : '#707070') : '#1d1d1f' }}
                      >
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
        <NavBar left="Back" right="Marketing Assessment" onLeft={onBack} />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[660px] mx-auto px-5 pt-16 pb-20 flex flex-col items-center text-center gap-0">

            {/* Eyebrow */}
            <p className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.1px]">
              Full-Stack Marketing Assessment
            </p>

            {/* Hero headline */}
            <h1 className="text-[56px] font-bold leading-[1.07] tracking-[-0.9px] text-[#1d1d1f] mt-4">
              Know your<br />marketing system.
            </h1>

            {/* Subtitle */}
            <p className="text-[20px] font-light text-[#707070] leading-[1.4] tracking-[-0.2px] max-w-[520px] mt-5">
              Questions test scope, depth, diagnostic reasoning and business judgement — not just tool recognition.
            </p>

            {/* Feature cards 2×2 */}
            <div className="grid grid-cols-2 gap-3 w-full mt-10 text-left">
              {[
                {
                  label: '77 elements',
                  sub: '13 domains · 3 levels each',
                  icon: '◎',
                },
                {
                  label: 'Four score layers',
                  sub: 'Scope · Depth · Diagnostic · Judgement',
                  icon: '◈',
                },
                {
                  label: 'Anti-pattern detection',
                  sub: 'Wrong answers tagged by thinking trap',
                  icon: '↑',
                },
                {
                  label: 'Candidate profile',
                  sub: 'T-Shaped · Full-Stack · Specialist',
                  icon: '○',
                },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-[28px] p-7">
                  <span className="text-[20px] text-[#1d1d1f] mb-3 block">{item.icon}</span>
                  <p className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.1px]">{item.label}</p>
                  <p className="text-[14px] text-[#707070] tracking-[-0.04px] mt-1 leading-[1.43]">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={startQuiz}
              className="mt-10 px-[22px] py-[11px] bg-[#0071e3] text-white rounded-full text-[17px] font-normal hover:bg-[#0077ed] transition-colors cursor-pointer"
            >
              Begin assessment
            </button>

            <p className="text-[12px] text-[#707070] mt-4 tracking-[-0.04px]">
              {QUIZ_ELEMENTS.length} elements · up to {QUIZ_ELEMENTS.length * 3} questions · 5 scenario blocks
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION / FEEDBACK ────────────────────────────────────────────────────

  if (!currentElement || !currentQuestion) return null;

  const qType = getQuestionType(currentElement.id, currentQuestion.difficulty, currentQuestion);
  const qTypeLabels: Record<QuestionType, string> = {
    knowledge: 'Knowledge', applied: 'Applied', diagnostic: 'Diagnostic',
    systems: 'Systems', executive: 'Judgement',
  };
  // Difficulty label only when it adds info beyond the qType chip
  const difficultyLabel = currentQuestion.difficulty === 'hard' ? 'Hard' : null;

  return (
    <div className="h-screen bg-[#f5f5f7] flex flex-col overflow-hidden">
      <NavBar
        left="Exit"
        right={`${elementIndex + 1} / ${totalElements}`}
        onLeft={onBack}
      />
      <ProgressLine pct={progressPct} />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[660px] mx-auto px-5 py-10 flex flex-col gap-5">

          {/* Meta chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip label={currentElement.categoryName} />
            <span className="text-[12px] text-[#e8e8ed]">·</span>
            <span className="text-[13px] font-medium text-[#1d1d1f]">{currentElement.name}</span>
            <div className="ml-auto flex gap-2">
              {difficultyLabel && <Chip label={difficultyLabel} />}
              <Chip label={qTypeLabels[qType]} />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-[28px] px-7 py-7">
            <p className="text-[24px] font-semibold leading-[1.29] tracking-[-0.36px] text-[#1d1d1f]">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-[10px]">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              const isRevealing = phase === 'feedback';

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={phase === 'feedback'}
                  className="w-full text-left bg-white rounded-[28px] border-2 transition-all duration-100"
                  style={{
                    borderColor: isRevealing
                      ? isCorrect ? '#34c759' : isSelected ? '#ff3b30' : 'transparent'
                      : 'transparent',
                    backgroundColor: isRevealing
                      ? isCorrect ? 'rgba(52,199,89,0.06)' : isSelected ? 'rgba(255,59,48,0.06)' : 'white'
                      : 'white',
                    opacity: isRevealing && !isCorrect && !isSelected ? 0.35 : 1,
                    cursor: phase === 'feedback' ? 'default' : 'pointer',
                  }}
                >
                  <div className="flex items-start gap-4 px-7 py-5">
                    <span
                      className="text-[12px] font-semibold shrink-0 mt-[1px] w-4 text-center"
                      style={{
                        color: isRevealing
                          ? isCorrect ? '#34c759' : isSelected ? '#ff3b30' : '#e8e8ed'
                          : '#707070',
                      }}
                    >
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span
                      className="text-[17px] leading-[1.47] tracking-[-0.1px]"
                      style={{ color: isRevealing ? (isCorrect ? '#1d7a45' : isSelected ? '#c0392b' : '#707070') : '#1d1d1f' }}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
