export type Difficulty = 1 | 2 | 3;

export type GameMode = 'mixed' | 'flags' | 'clues';

export type QuestionType = 'country' | 'capital' | 'flag' | 'clue';

export type GamePhase = 'idle' | 'spinning' | 'question' | 'feedback' | 'revive' | 'gameover';

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

export interface WeeklyLeaderboardEntry {
  id: string;
  player_id: string;
  player_name: string;
  week_start: string;
  mode: GameMode;
  score: number;
  correct_answers: number;
  total_questions: number;
  games_played: number;
  updated_at: string;
}