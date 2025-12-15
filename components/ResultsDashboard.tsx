import React from 'react';
import { QuizResult, Category } from '../types';
import { Trophy, Calendar, Clock } from 'lucide-react';

interface ResultsDashboardProps {
  results: QuizResult[];
  categories: Category[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, categories }) => {
  // Sort by latest
  const sortedResults = [...results].sort((a, b) => b.timestamp - a.timestamp);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown Category';

  if (results.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <Trophy className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Results Yet</h3>
        <p className="text-slate-500 dark:text-slate-400">Complete a quiz to see your performance history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Performance History</h2>
      
      <div className="grid gap-4">
        {sortedResults.map((res) => {
          const percentage = Math.round((res.score / res.totalQuestions) * 100);
          const isPass = percentage >= 60;

          return (
            <div key={res.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{getCategoryName(res.categoryId)}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isPass ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                    {isPass ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(res.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {Math.floor(res.timeSpentSeconds / 60)}m {res.timeSpentSeconds % 60}s
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{percentage}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ACCURACY</div>
                 </div>
                 <div className="text-right pl-6 border-l border-slate-100 dark:border-slate-700">
                    <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">{res.score}/{res.totalQuestions}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">SCORE</div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};