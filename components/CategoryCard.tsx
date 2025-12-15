import React from 'react';
import { Trash2, Edit, Play, Upload } from 'lucide-react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  questionCount: number;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string) => void;
  onEdit: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, questionCount, onSelect, onDelete, onUpload, onEdit }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
          <span className="text-2xl">📚</span>
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
            title="Edit Category"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onUpload(category.id); }}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
            title="Upload Questions"
          >
            <Upload size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full transition-colors"
            title="Delete Category"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">{category.name}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3">{category.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
          {questionCount} Questions
        </span>
        <button 
          onClick={() => onSelect(category.id)}
          disabled={questionCount === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${questionCount > 0 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-sm hover:shadow-indigo-200' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}
          `}
        >
          <span>Start Quiz</span>
          <Play size={16} className={questionCount > 0 ? "fill-white" : ""} />
        </button>
      </div>
    </div>
  );
};