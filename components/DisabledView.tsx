import React from 'react';
import { Lock, Construction } from 'lucide-react';

interface DisabledViewProps {
  title: string;
  message: string;
}

export const DisabledView: React.FC<DisabledViewProps> = ({ title, message }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-lg">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-slate-400 dark:text-slate-300" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-full border border-yellow-200 dark:border-yellow-900/30">
          <Construction size={16} />
          <span>Under Development</span>
        </div>
      </div>
    </div>
  );
};