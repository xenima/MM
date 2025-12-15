import React, { useState } from 'react';
import { Modal } from './Modal';
import { Category, Question, Difficulty } from '../types';
import { Play, BarChart } from 'lucide-react';

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  questions: Question[];
  onStart: (difficulty: Difficulty | 'all') => void;
}

export const QuizSetupModal: React.FC<QuizSetupModalProps> = ({ isOpen, onClose, category, questions, onStart }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');

  if (!category) return null;

  const counts = {
    all: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  // Count unclassified as medium or handle separately? 
  // For UI simplicity, let's treat unclassified in "all" only.
  
  const DifficultyOption = ({ type, label, colorClass }: { type: Difficulty | 'all', label: string, colorClass: string }) => {
    const count = counts[type];
    const isSelected = selectedDifficulty === type;
    const isDisabled = count === 0;

    return (
      <button
        onClick={() => setSelectedDifficulty(type)}
        disabled={isDisabled}
        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
          ${isSelected 
            ? `border-${colorClass}-500 bg-${colorClass}-50 dark:bg-${colorClass}-900/20 ring-1 ring-${colorClass}-500` 
            : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSelected ? `bg-${colorClass}-200 dark:bg-${colorClass}-900 text-${colorClass}-800 dark:text-${colorClass}-300` : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
            <BarChart size={18} />
          </div>
          <div className="text-left">
            <div className={`font-semibold ${isSelected ? `text-${colorClass}-900 dark:text-${colorClass}-300` : 'text-slate-700 dark:text-slate-300'}`}>{label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{isDisabled ? 'No questions' : `${count} questions`}</div>
          </div>
        </div>
        {isSelected && <div className={`w-3 h-3 rounded-full bg-${colorClass}-500`} />}
      </button>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Exam">
      <div className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{category.name}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{category.description}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Select Difficulty</label>
          <DifficultyOption type="all" label="All Difficulties" colorClass="indigo" />
          <DifficultyOption type="easy" label="Easy" colorClass="green" />
          <DifficultyOption type="medium" label="Medium" colorClass="yellow" />
          <DifficultyOption type="hard" label="Hard" colorClass="red" />
        </div>

        <div className="pt-4">
          <button
            onClick={() => onStart(selectedDifficulty)}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Exam</span>
            <Play size={18} className="fill-white" />
          </button>
        </div>
      </div>
    </Modal>
  );
};