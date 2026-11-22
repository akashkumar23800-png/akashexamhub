import type { AttemptAnswerRow, AttemptRow } from '@/lib/types';

export interface TrendPoint {
  id: string;
  label: string;
  percent: number;
}

export interface SubjectProgress {
  subjectId: string;
  answered: number;
  correct: number;
}

export interface AnalyticsSummary {
  testsAttempted: number;
  averageScorePercent: number | null;
  accuracyPercent: number | null;
  correctAnswers: number;
  incorrectAnswers: number;
  learningProgressPercent: number;
  trend: TrendPoint[];
  subjects: SubjectProgress[];
}

const TREND_LENGTH = 10;

export function buildAnalytics(
  attempts: AttemptRow[],
  answers: AttemptAnswerRow[],
  totalQuestions: number,
): AnalyticsSummary {
  const percents = attempts.map((attempt) =>
    attempt.max_score > 0 ? (attempt.score / attempt.max_score) * 100 : 0,
  );
  const averageScorePercent = percents.length
    ? percents.reduce((sum, value) => sum + value, 0) / percents.length
    : null;

  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.correct_count, 0);
  const incorrectAnswers = attempts.reduce((sum, attempt) => sum + attempt.incorrect_count, 0);
  const answeredTotal = correctAnswers + incorrectAnswers;
  const accuracyPercent = answeredTotal > 0 ? (correctAnswers / answeredTotal) * 100 : null;

  const answeredQuestionIds = new Set(
    answers.filter((answer) => answer.is_correct !== null).map((answer) => answer.question_id),
  );
  const learningProgressPercent =
    totalQuestions > 0 ? Math.min(100, (answeredQuestionIds.size / totalQuestions) * 100) : 0;

  const trend = attempts.slice(-TREND_LENGTH).map((attempt, index, recent) => {
    const offset = attempts.length - recent.length;
    return {
      id: attempt.id,
      label: new Date(attempt.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      percent: percents[offset + index],
    };
  });

  const subjectMap = new Map<string, SubjectProgress>();
  for (const answer of answers) {
    if (answer.is_correct === null) continue;
    const entry = subjectMap.get(answer.subject_id) ?? { subjectId: answer.subject_id, answered: 0, correct: 0 };
    entry.answered += 1;
    if (answer.is_correct) entry.correct += 1;
    subjectMap.set(answer.subject_id, entry);
  }

  return {
    testsAttempted: attempts.length,
    averageScorePercent,
    accuracyPercent,
    correctAnswers,
    incorrectAnswers,
    learningProgressPercent,
    trend,
    subjects: Array.from(subjectMap.values()),
  };
}
