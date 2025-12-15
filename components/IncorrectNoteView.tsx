import React, { useState } from 'react';
import { AppData, Question, Category, IncorrectRecord } from '../types';
import { Trash2, RotateCcw, Search, BookOpen, AlertCircle } from 'lucide-react';

interface IncorrectNoteViewProps {
  data: AppData;
  onRetake: (questions: Question[]) => void;
  onRemoveRecord: (questionId: string) => void;
}

export const IncorrectNoteView: React.FC<IncorrectNoteViewProps> = ({ data, onRetake, onRemoveRecord }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Map records to actual Question objects
  const incorrectQuestions = data.incorrectRecords.map(record => {
    const categoryQuestions = data.questions[record.categoryId] || [];
    const question = categoryQuestions.find(q => q.id === record.questionId);
    return { record, question, category: data.categories.find(c => c.id === record.categoryId) };
  }).filter(item => item.question !== undefined) as { record: IncorrectRecord, question: Question, category: Category }[];

  // Filter Logic
  const filteredItems = incorrectQuestions.filter(item => {
    const matchesText = item.question.text.toLowerCase().includes(filterText.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || item.record.categoryId === selectedCategoryFilter;
    return matchesText && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(incorrectQuestions.map(i => i.category))).filter(Boolean);

  const handleRetakeAll = () => {
    const questionsToRetake = filteredItems.map(item => item.question);
    if (questionsToRetake.length > 0) {
      onRetake(questionsToRetake);
    }
  };

  if (incorrectQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Clean Sheet!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          You don't have any incorrect answers saved. Keep up the good work! Incorrect answers during exams will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="text-red-500" />
            Incorrect Answer Note
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Review and retake questions you missed.</p>
        </div>
        <button
          onClick={handleRetakeAll}
          disabled={filteredItems.length === 0}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RotateCcw size={18} />
          <span>Retake {filteredItems.length} Questions</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <select 
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">No matching questions found.</div>
        ) : (
          filteredItems.map(({ item, question, category, record }: any) => (
            <div key={record.questionId} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md uppercase">
                    {category?.name}
                  </span>
                  {question.difficulty && (
                    <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase
                      ${question.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                        question.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}
                    `}>
                      {question.difficulty}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => onRemoveRecord(question.id)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full transition-colors"
                  title="Remove from Incorrect Note"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 pr-8">{question.text}</h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                 <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                 <div>
                    <span className="font-bold">Correct Answer:</span> {question.options.find((o: any) => o.id === question.correctOptionId)?.text}
                 </div>
              </div>

              {question.explanation && (
                 <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                   <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation:</span> {question.explanation}
                 </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};