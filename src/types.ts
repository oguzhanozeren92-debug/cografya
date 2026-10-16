export type Difficulty = 1 | 2 | 3;

export type QuestionType = 'country' | 'capital';

export type GamePhase = 'idle' | 'spinning' | 'question' | 'feedback' | 'gameover';

export interface CountryMeta {
  nameTr: string;
  capitalTr: string;
  difficulty: Difficulty;
}

export interface RoundResult {
  countryId: string;
  countryName: string;
  questionType: QuestionType;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  created_at: string;
}
