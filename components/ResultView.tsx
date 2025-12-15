import React from 'react';
import { QuizResult, Question, Category } from '../types';
import { CheckCircle, XCircle, Award, ArrowLeft, RotateCcw } from 'lucide-react';

interface ResultViewProps {
  result: QuizResult;
  category: Category;
  questions: Question[];
  onBack: () => void;
  onRetry: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, category, questions, onBack, onRetry }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  let gradeColor = 'text-red-500';
  let gradeText = 'Needs Improvement';
  let GradeIcon = XCircle;

  if (percentage >= 80) {
    gradeColor = 'text-green-500';
    gradeText = 'Excellent!';
    GradeIcon = Award;
  } else if (percentage >= 60) {
    gradeColor = 'text-yellow-500';
    gradeText = 'Good Job';
    GradeIcon = CheckCircle;
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{category.name} Results</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base">Completed on {new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString()}</p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-0 md:space-x-12 mb-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">{result.score}<span className="text-2xl md:text-3xl text-slate-400 dark:text-slate-500">/{result.totalQuestions}</span></div>
            <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Score</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-200 dark:bg-slate-700"></div>
          <div className="md:hidden w-16 h-px bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <div className={`text-4xl md:text-5xl font-extrabold ${gradeColor} mb-1`}>{percentage}%</div>
            <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1 justify-center">
              {gradeText}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 md:space-x-4">
          <button 
            onClick={onBack}
            className="w-full md:w-auto px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
          <button 
            onClick={onRetry}
            className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw size={18} />
            <span>Retry Quiz</span>
          </button>
        </div>
      </div>

      {/* Answer Review */}
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 px-2">Detailed Breakdown</h3>
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const userAnswerId = result.answers[q.id];
          const isCorrect = userAnswerId === q.correctOptionId;
          
          return (
            <div key={q.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 md:p-6 ${isCorrect ? 'border-slate-200 dark:border-slate-700' : 'border-red-200 dark:border-red-900/50 bg-red-50/10 dark:bg-red-900/10'}`}>
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                `}>
                  {idx + 1}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">{q.text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map(opt => {
                      const isSelected = userAnswerId === opt.id;
                      const isTargetCorrect = opt.id === q.correctOptionId;
                      
                      let styles = "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300";
                      let icon = null;

                      if (isTargetCorrect) {
                        styles = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 font-medium";
                        icon = <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
                      } else if (isSelected && !isTargetCorrect) {
                        styles = "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                        icon = <XCircle size={16} className="text-red-600 dark:text-red-400" />;
                      } else if (isSelected) {
                        // Correctly selected (already covered by first if, but purely for logic clarity)
                        styles = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
                      }

                      return (
                        <div key={opt.id} className={`px-4 py-3 rounded-lg border text-sm flex items-center justify-between ${styles}`}>
                          <span className="break-words">{opt.text}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isCorrect && q.explanation && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};