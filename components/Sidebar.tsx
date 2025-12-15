import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart3, Lock, Users, Database, LogOut, BookX, X, Moon, Sun } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, isDarkMode, toggleTheme }) => {
  
  const NavItem = ({ view, icon: Icon, label, disabled = false }: { view: ViewState; icon: any; label: string; disabled?: boolean }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          if (!disabled) {
            onChangeView(view);
            onClose(); // Close sidebar on mobile when item clicked
          }
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 
          ${isActive 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
        {disabled && <Lock size={14} className="ml-auto opacity-50" />}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
             <CheckSquare className="fill-indigo-600 dark:fill-indigo-400 text-white dark:text-slate-900" />
             <span className="md:inline">MDEET Master</span>
          </h1>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Main</div>
          <NavItem view={ViewState.HOME} icon={LayoutDashboard} label="Categories" />
          <NavItem view={ViewState.INCORRECT_NOTE} icon={BookX} label="Incorrect Answers" />
          <NavItem view={ViewState.RESULT} icon={BarChart3} label="My Grades" />

          <div className="mt-8 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Admin (Locked)</div>
          <NavItem view={ViewState.ADMIN_USERS} icon={Users} label="User Management" disabled />
          <NavItem view={ViewState.ADMIN_DATA} icon={Database} label="Data Management" disabled />
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
           </button>
           <NavItem view={ViewState.LOGIN} icon={LogOut} label="Log Out" disabled />
        </div>
      </div>
    </>
  );
};

export default Sidebar;