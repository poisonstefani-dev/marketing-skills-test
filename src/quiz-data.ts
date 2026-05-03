/**
 * quiz-data.ts — thin transformer
 *
 * All question content lives in quiz-content.json.
 * Edit that file to update questions, answers, domains, or results levels.
 * This file converts the JSON into the TypeScript types used by the quiz engine.
 */

import rawContent from './quiz-content.json';

// ── Public types ──────────────────────────────────────────────────────────────

export type QuestionType = 'knowledge' | 'applied' | 'diagnostic' | 'systems' | 'executive';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Populated from JSON — available after quiz-content.json is the source of truth */
  questionType?: QuestionType;
  /** Anti-pattern tag per option [A,B,C,D]; null means no anti-pattern tagged */
  antiPatterns?: (string | null)[];
}

export interface QuizElement {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  /** Domain grouping for the v2 scoring model (13 domains) */
  domain?: string;
  questions: [QuizQuestion, QuizQuestion, QuizQuestion];
}

export interface QuizResultLevel {
  min: number;
  max: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  learningPath: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function letterToIndex(letter: string): number {
  return ({ A: 0, B: 1, C: 2, D: 3 } as Record<string, number>)[
    letter.toUpperCase()
  ] ?? 0;
}

// ── Transform ─────────────────────────────────────────────────────────────────

type RawQuestion = (typeof rawContent.elements)[number]['questions'][number];

function transformQuestion(q: RawQuestion): QuizQuestion {
  return {
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
    questionType: q.questionType as QuestionType,
    question: q.question,
    options: [q.a, q.b, q.c, q.d],
    correctIndex: letterToIndex(q.correct),
    antiPatterns: q.antiPatterns as (string | null)[],
  };
}

export const QUIZ_ELEMENTS: QuizElement[] = rawContent.elements.map(el => ({
  id: el.id,
  name: el.name,
  categoryId: el.categoryId,
  categoryName: el.categoryName,
  domain: el.domain,
  questions: [
    transformQuestion(el.questions[0]),
    transformQuestion(el.questions[1]),
    transformQuestion(el.questions[2]),
  ],
}));

export const QUIZ_RESULTS: QuizResultLevel[] = rawContent.results as QuizResultLevel[];
