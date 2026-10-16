import { Check, X, MapPin, Building2 } from 'lucide-react';
import type { GamePhase, QuestionType } from '@/types';

interface QuestionPanelProps {
  questionType: QuestionType;
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  phase: GamePhase;
  onAnswer: (answer: string) => void;
}

export function QuestionPanel({
  questionType,
  options,
  selectedAnswer,
  correctAnswer,
  phase,
  onAnswer,
}: QuestionPanelProps) {
  const isFeedback = phase === 'feedback';
  const isCountryQuestion = questionType === 'country';

  return (
    <div className="relative z-10 px-4 pb-5 animate-slide-up">
      <div className="glass-panel mx-auto max-w-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isCountryQuestion ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
            {isCountryQuestion ? <MapPin className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          </div>
          <h2 className="text-lg font-semibold text-white">
            {isCountryQuestion ? 'Bu hangi ülke?' : 'Bu ülkenin başkenti neresi?'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === correctAnswer;

            let className = 'option-btn';
            if (isFeedback) {
              if (isCorrect) className += ' option-btn-correct';
              else if (isSelected) className += ' option-btn-wrong';
              else className += ' option-btn-disabled';
            }

            return (
              <button
                key={option}
                onClick={() => !isFeedback && onAnswer(option)}
                disabled={isFeedback}
                className={className}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {isFeedback && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                  {isFeedback && isSelected && !isCorrect && <X className="h-5 w-5 text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {isFeedback && (
          <div className="mt-4 flex items-center">
            <div className="flex items-center gap-2">
              {selectedAnswer === correctAnswer ? (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="font-semibold text-emerald-400">Doğru!</span>
                </>
              ) : (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20">
                    <X className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="font-semibold text-red-400">
                    Yanlış! Doğru cevap: {correctAnswer}
                  </span>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
