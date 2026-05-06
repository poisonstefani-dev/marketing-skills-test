/**
 * testLogger.ts — session-level test log store
 *
 * Persists every quiz attempt to localStorage under key `msa_test_logs_v1`.
 * Each session captures per-question timing, answer choices, anti-pattern
 * triggers, and a final result summary.
 *
 * Exported data structure is stable so a future dashboard can read it
 * without migration — add fields, never rename or delete.
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface QuestionLog {
  /** Stable identifier — e.g. "jtbd-easy" or fundamentals question id */
  questionId: string;
  /** Full-test element ID (e.g. "jtbd"). Omitted for fundamentals. */
  elementId?: string;
  /** Fundamentals concept label (e.g. "Brand Strategy"). Omitted for full test. */
  concept?: string;
  /** Domain grouping (e.g. "Strategy & Market Thinking") */
  domain?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'n/a';
  questionType: string;
  questionText: string;
  /** Exact text of the option the user clicked */
  selectedOptionText: string;
  /** Exact text of the correct option */
  correctOptionText: string;
  correct: boolean;
  /** Anti-pattern tag on wrong answers (null when correct or no tag) */
  antiPattern: string | null;
  /** Milliseconds from question first render to user click */
  timeMs: number;
}

export interface FundamentalsResult {
  correctCount: number;
  totalCount: number;
  scorePct: number;
  /** e.g. "Strong Foundations" */
  level: string;
}

export interface FullTestResult {
  correctCount: number;
  totalCount: number;
  overallScore: number;
  scopeScore: number;
  depthScore: number;
  diagnosticScore: number;
  judgementScore: number;
  /** e.g. "T-Shaped Strategic Operator" */
  profile: string;
  level: string;
  /** Map of anti-pattern key → count of times triggered */
  antiPatterns: Record<string, number>;
  domainScores: Array<{
    domain: string;
    correct: number;
    total: number;
    pct: number;
  }>;
}

export type TestResult = FundamentalsResult | FullTestResult;

export interface TestSession {
  sessionId: string;
  testType: 'fundamentals' | 'full';
  /** ISO 8601 — moment the test started */
  startedAt: string;
  /** ISO 8601 — moment results were shown. null = abandoned mid-quiz. */
  completedAt: string | null;
  /** Total milliseconds from start to results. null if not completed. */
  durationMs: number | null;
  questions: QuestionLog[];
  result: TestResult | null;
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

const KEY = 'msa_test_logs_v1';

function load(): TestSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(sessions: TestSession[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // Quota exceeded or SSR — silently drop
  }
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── SESSION LIFECYCLE API ────────────────────────────────────────────────────

/**
 * Create a new session entry in storage and return its ID.
 * Call at the moment the user starts answering questions.
 */
export function startSession(testType: 'fundamentals' | 'full'): string {
  const sessionId = uid();
  const sessions = load();
  sessions.push({
    sessionId,
    testType,
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMs: null,
    questions: [],
    result: null,
  });
  persist(sessions);
  return sessionId;
}

/**
 * Append a single question answer to an in-progress session.
 * Call immediately after the user selects an option.
 */
export function logQuestion(sessionId: string, q: QuestionLog): void {
  const sessions = load();
  const s = sessions.find(x => x.sessionId === sessionId);
  if (!s) return;
  s.questions.push(q);
  persist(sessions);
}

/**
 * Mark a session complete with final scoring data.
 * Call once when the results screen is first shown.
 */
export function completeSession(sessionId: string, result: TestResult): void {
  const sessions = load();
  const s = sessions.find(x => x.sessionId === sessionId);
  if (!s) return;
  s.completedAt = new Date().toISOString();
  s.durationMs =
    new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
  s.result = result;
  persist(sessions);
}

// ─── READ / EXPORT API ───────────────────────────────────────────────────────

/** All stored sessions, newest first. */
export function getSessions(): TestSession[] {
  return [...load()].reverse();
}

/** Single session by ID, or null. */
export function getSession(sessionId: string): TestSession | null {
  return load().find(s => s.sessionId === sessionId) ?? null;
}

/**
 * Pretty-printed JSON blob ready for copy/paste or file download.
 * Schema:
 * {
 *   exported_at: ISO string,
 *   session_count: number,
 *   sessions: TestSession[]
 * }
 */
export function exportJSON(): string {
  const sessions = load();
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      session_count: sessions.length,
      sessions,
    },
    null,
    2,
  );
}

/** Wipe all logs from localStorage. */
export function clearLogs(): void {
  try {
    localStorage.removeItem(KEY);
  } catch { /* noop */ }
}

// ─── AGGREGATE STATS ──────────────────────────────────────────────────────────

/**
 * Cross-session aggregate stats for dashboard consumption.
 * Only includes completed sessions (completedAt !== null).
 *
 * Return shape is intentionally flat for easy chart binding.
 */
export function getAggregateStats() {
  const completed = load().filter(s => s.completedAt !== null);
  const fund = completed.filter(s => s.testType === 'fundamentals');
  const full = completed.filter(s => s.testType === 'full');

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const fundScores = fund
    .map(s => (s.result as FundamentalsResult | null)?.scorePct ?? null)
    .filter((n): n is number => n !== null);

  const fullScores = full
    .map(s => (s.result as FullTestResult | null)?.overallScore ?? null)
    .filter((n): n is number => n !== null);

  const allQs = completed.flatMap(s => s.questions);

  // ── Accuracy by domain ────────────────────────────────────────────────────
  const byDomain: Record<string, { correct: number; total: number; pct: number }> = {};
  allQs.forEach(q => {
    if (!q.domain) return;
    byDomain[q.domain] ??= { correct: 0, total: 0, pct: 0 };
    byDomain[q.domain].total++;
    if (q.correct) byDomain[q.domain].correct++;
  });
  Object.values(byDomain).forEach(d => {
    d.pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
  });

  // ── Accuracy by difficulty ────────────────────────────────────────────────
  const byDifficulty: Record<string, { correct: number; total: number; pct: number }> = {};
  allQs.forEach(q => {
    byDifficulty[q.difficulty] ??= { correct: 0, total: 0, pct: 0 };
    byDifficulty[q.difficulty].total++;
    if (q.correct) byDifficulty[q.difficulty].correct++;
  });
  Object.values(byDifficulty).forEach(d => {
    d.pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
  });

  // ── Accuracy by question type ─────────────────────────────────────────────
  const byType: Record<string, { correct: number; total: number; pct: number }> = {};
  allQs.forEach(q => {
    byType[q.questionType] ??= { correct: 0, total: 0, pct: 0 };
    byType[q.questionType].total++;
    if (q.correct) byType[q.questionType].correct++;
  });
  Object.values(byType).forEach(d => {
    d.pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
  });

  // ── Anti-pattern frequency ────────────────────────────────────────────────
  const antiPatterns: Record<string, number> = {};
  allQs
    .filter(q => !q.correct && q.antiPattern)
    .forEach(q => {
      antiPatterns[q.antiPattern!] = (antiPatterns[q.antiPattern!] ?? 0) + 1;
    });

  // ── Per-question avg time (sorted slowest-first) ──────────────────────────
  const timeBuckets: Record<string, number[]> = {};
  allQs.forEach(q => {
    timeBuckets[q.questionId] ??= [];
    timeBuckets[q.questionId].push(q.timeMs);
  });
  const avgTimeByQuestion = Object.fromEntries(
    Object.entries(timeBuckets)
      .map(([id, times]) => [id, avg(times)])
      .sort((a, b) => (b[1] as number) - (a[1] as number)),
  );

  // ── Session durations ─────────────────────────────────────────────────────
  const durations = completed
    .map(s => s.durationMs)
    .filter((d): d is number => d !== null);

  return {
    totalSessions: completed.length,
    abandonedSessions: load().filter(s => s.completedAt === null).length,
    fundamentals: {
      count: fund.length,
      avgScore: avg(fundScores),
      scores: fundScores,
    },
    full: {
      count: full.length,
      avgScore: avg(fullScores),
      scores: fullScores,
    },
    questions: {
      total: allQs.length,
      correct: allQs.filter(q => q.correct).length,
      pct: allQs.length
        ? Math.round((allQs.filter(q => q.correct).length / allQs.length) * 100)
        : 0,
      avgTimeMs: avg(allQs.map(q => q.timeMs)),
      byDomain,
      byDifficulty,
      byType,
      antiPatterns,
      avgTimeByQuestion,
    },
    sessions: {
      avgDurationMs: avg(durations),
      minDurationMs: durations.length ? Math.min(...durations) : 0,
      maxDurationMs: durations.length ? Math.max(...durations) : 0,
    },
  };
}
