import React, { useState, useEffect } from 'react';
import { Question, QuizResult, Category } from '../types';
import { ArrowRight, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

interface QuizTakerProps {
  category: Category;
  questions: Question[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ category, questions, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: optionId
    }));
  };

  const handleSubmit = () => {
    const endTime = Date.now();
    let score = 0;
    
    questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        score++;
      }
    });

    const result: QuizResult = {
      id: Date.now().toString(),
      categoryId: category.id,
      score,
      totalQuestions: questions.length,
      timestamp: endTime,
      answers,
      timeSpentSeconds: Math.floor((endTime - startTime) / 1000)
    };

    onComplete(result);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 md:top-4 z-20 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{category.name}</h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">Question {currentIndex + 1} of {questions.length}</div>
        </div>
        <div className={`self-end md:self-auto flex items-center space-x-2 px-4 py-2 rounded-lg font-mono font-medium 
          ${timeLeft < 60 
            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
          <Clock size={18} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-6">
        <div 
          className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 flex-grow overflow-y-auto">
        <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-slate-100 mb-6 md:mb-8 leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                  ${isSelected 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100 shadow-sm' 
                    : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }
                `}
              >
                <span className="flex items-center space-x-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-slate-500 group-hover:text-indigo-600 dark:group-hover:text-white'}
                  `}>
                    {option.id.toUpperCase().slice(-1)}
                  </span>
                  <span className="text-sm md:text-base">{option.text}</span>
                </span>
                {isSelected && <CheckCircle2 className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 flex flex-col-reverse md:flex-row justify-between items-center gap-3 md:gap-0 pb-6 md:pb-0">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-800 md:bg-transparent md:dark:bg-transparent border md:border-0 border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={20} />
          <span>Previous</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            <span>Finish Exam</span>
            <CheckCircle2 size={20} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            <span>Next Question</span>
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};