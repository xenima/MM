import React, { useState, useEffect } from 'react';
import { ViewState, AppData, Category, QuizResult, Question, Difficulty } from './types';
import { loadData, saveData, parseQuestionsFile, downloadTemplate, generateId } from './utils';
import Sidebar from './components/Sidebar';
import { CategoryCard } from './components/CategoryCard';
import { Modal } from './components/Modal';
import { QuizTaker } from './components/QuizTaker';
import { ResultView } from './components/ResultView';
import { DisabledView } from './components/DisabledView';
import { ResultsDashboard } from './components/ResultsDashboard';
import { QuizSetupModal } from './components/QuizSetupModal';
import { IncorrectNoteView } from './components/IncorrectNoteView';
import { Plus, Download, UploadCloud, AlertCircle, Menu, CheckSquare } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [data, setData] = useState<AppData>(loadData());
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Selection State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [setupCategory, setSetupCategory] = useState<Category | null>(null); // For the setup modal
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]); // Questions currently being used in quiz
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  // Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Persist data on change
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Actions
  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return;

    if (editingCategoryId) {
      // Edit existing
      setData(prev => ({
        ...prev,
        categories: prev.categories.map(c => 
          c.id === editingCategoryId 
            ? { ...c, name: newCategoryName, description: newCategoryDesc }
            : c
        )
      }));
    } else {
      // Create new
      const newCat: Category = {
        id: generateId(),
        name: newCategoryName,
        description: newCategoryDesc,
        createdAt: Date.now()
      };
      setData(prev => ({
        ...prev,
        categories: [...prev.categories, newCat],
        questions: { ...prev.questions, [newCat.id]: [] }
      }));
    }
    
    setNewCategoryName('');
    setNewCategoryDesc('');
    setEditingCategoryId(null);
    setIsCategoryModalOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setNewCategoryName(category.name);
    setNewCategoryDesc(category.description);
    setEditingCategoryId(category.id);
    setIsCategoryModalOpen(true);
  };

  const openCreateCategoryModal = () => {
    setNewCategoryName('');
    setNewCategoryDesc('');
    setEditingCategoryId(null);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (!window.confirm("Are you sure? This will delete all questions in this category.")) return;
    setData(prev => {
      const { [id]: deleted, ...remainingQuestions } = prev.questions;
      return {
        ...prev,
        categories: prev.categories.filter(c => c.id !== id),
        questions: remainingQuestions
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !uploadTargetId) return;
    const file = e.target.files[0];
    
    try {
      const newQuestions = await parseQuestionsFile(file);
      setData(prev => ({
        ...prev,
        questions: {
          ...prev.questions,
          [uploadTargetId]: [...(prev.questions[uploadTargetId] || []), ...newQuestions]
        }
      }));
      alert(`Successfully added ${newQuestions.length} questions.`);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      alert(`Error uploading file: ${err.message}`);
    }
  };

  // Opens the setup modal
  const initiateQuizSetup = (catId: string) => {
    const cat = data.categories.find(c => c.id === catId);
    if (cat) {
      setSetupCategory(cat);
      setIsSetupModalOpen(true);
    }
  };

  // Starts the quiz after configuration
  const handleStartQuiz = (difficulty: Difficulty | 'all') => {
    if (!setupCategory) return;
    
    const allQuestions = data.questions[setupCategory.id] || [];
    let filtered = allQuestions;
    if (difficulty !== 'all') {
      filtered = allQuestions.filter(q => q.difficulty === difficulty);
    }

    if (filtered.length === 0) {
      alert("No questions found for this difficulty.");
      return;
    }

    // Shuffle questions logic could be added here
    setActiveQuestions(filtered);
    setSelectedCategoryId(setupCategory.id);
    setIsSetupModalOpen(false);
    setCurrentView(ViewState.QUIZ_ACTIVE);
  };

  // Starts a quiz from the Incorrect Note retake feature
  const handleRetakeIncorrect = (questions: Question[]) => {
    if (questions.length === 0) return;

    // Find category of first question to use as context (or create a virtual one)
    const firstQId = questions[0].id;
    let foundCatId = "";
    Object.entries(data.questions).forEach(([catId, qs]) => {
      if (qs.some(q => q.id === firstQId)) foundCatId = catId;
    });

    const mockCategory: Category = {
      id: foundCatId || 'mixed',
      name: 'Incorrect Answer Review',
      description: 'Retaking questions from your incorrect note.',
      createdAt: Date.now()
    };
    
    setSetupCategory(mockCategory); 
    setSelectedCategoryId(mockCategory.id);
    setActiveQuestions(questions);
    setCurrentView(ViewState.QUIZ_ACTIVE);
  };

  const handleQuizComplete = (result: QuizResult) => {
    setData(prev => {
      const newIncorrectRecords = [];
      const categoryQuestions = prev.questions[result.categoryId] || activeQuestions; 
      
      for (const [qId, selectedOptionId] of Object.entries(result.answers)) {
        const question = categoryQuestions.find(q => q.id === qId) || activeQuestions.find(q => q.id === qId);
        if (question && question.correctOptionId !== selectedOptionId) {
          const exists = prev.incorrectRecords.some(r => r.questionId === qId);
          if (!exists) {
            newIncorrectRecords.push({
              questionId: qId,
              categoryId: result.categoryId === 'mixed' ? getRealCategoryId(qId, prev.questions) : result.categoryId,
              timestamp: Date.now()
            });
          }
        }
      }

      return {
        ...prev,
        results: [...prev.results, result],
        incorrectRecords: [...prev.incorrectRecords, ...newIncorrectRecords]
      };
    });
    setLastQuizResult(result);
    setCurrentView(ViewState.RESULT);
  };

  const getRealCategoryId = (qId: string, questionsMap: Record<string, Question[]>) => {
    for (const [catId, qs] of Object.entries(questionsMap)) {
      if (qs.some(q => q.id === qId)) return catId;
    }
    return '';
  };

  const removeIncorrectRecord = (qId: string) => {
    setData(prev => ({
      ...prev,
      incorrectRecords: prev.incorrectRecords.filter(r => r.questionId !== qId)
    }));
  };

  // Render Logic
  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Exam Categories</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">Select a category to begin your assessment.</p>
              </div>
              <button 
                onClick={openCreateCategoryModal}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 font-medium shadow-sm transition-all"
              >
                <Plus size={20} />
                <span>New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  questionCount={data.questions[cat.id]?.length || 0}
                  onSelect={initiateQuizSetup}
                  onDelete={handleDeleteCategory}
                  onEdit={handleEditCategory}
                  onUpload={(id) => {
                    setUploadTargetId(id);
                    setIsUploadModalOpen(true);
                  }}
                />
              ))}
              
              {data.categories.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                  <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No categories yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first quiz category to get started</p>
                  <button onClick={openCreateCategoryModal} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Create Category</button>
                </div>
              )}
            </div>
          </div>
        );

      case ViewState.QUIZ_ACTIVE:
        if (!setupCategory || activeQuestions.length === 0) return <div>Error: Quiz configuration invalid</div>;
        return (
          <QuizTaker
            category={setupCategory}
            questions={activeQuestions}
            onComplete={handleQuizComplete}
            onExit={() => setCurrentView(ViewState.HOME)}
          />
        );

      case ViewState.RESULT:
        if (!lastQuizResult) return <ResultsDashboard results={data.results} categories={data.categories} />;
        const resCat = data.categories.find(c => c.id === lastQuizResult.categoryId) || { id: 'mixed', name: 'Review Session', description: '', createdAt: 0 };
        return (
          <ResultView
            result={lastQuizResult}
            category={resCat}
            questions={activeQuestions}
            onBack={() => setCurrentView(ViewState.HOME)}
            onRetry={() => setCurrentView(ViewState.QUIZ_ACTIVE)}
          />
        );

      case ViewState.INCORRECT_NOTE:
        return (
          <IncorrectNoteView 
            data={data}
            onRetake={handleRetakeIncorrect}
            onRemoveRecord={removeIncorrectRecord}
          />
        );

      case ViewState.LOGIN:
        return <DisabledView title="Login Restricted" message="User authentication is currently disabled for this public demo version." />;

      case ViewState.ADMIN_USERS:
      case ViewState.ADMIN_DATA:
        return <DisabledView title="Admin Access Restricted" message="Administrator panels are locked. Please contact the system owner for access credentials." />;
      
      default:
         return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center sticky top-0 z-20 shadow-sm relative">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="absolute left-2 text-slate-600 dark:text-slate-300 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
           <CheckSquare className="fill-indigo-600 dark:fill-indigo-400 text-white dark:text-slate-900" size={24} />
           MDEET Master
        </h1>
      </div>

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
        {renderContent()}
      </div>

      {/* Quiz Setup Modal */}
      <QuizSetupModal 
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        category={setupCategory}
        questions={setupCategory ? (data.questions[setupCategory.id] || []) : []}
        onStart={handleStartQuiz}
      />

      {/* Add/Edit Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategoryId ? "Edit Category" : "Create New Category"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="e.g., Mathematics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              rows={3}
              value={newCategoryDesc}
              onChange={e => setNewCategoryDesc(e.target.value)}
              placeholder="Brief description of this quiz category..."
            />
          </div>
          <button 
            onClick={handleSaveCategory}
            disabled={!newCategoryName.trim()}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {editingCategoryId ? "Update Category" : "Create Category"}
          </button>
        </div>
      </Modal>

      {/* Upload Questions Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Questions">
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
             <AlertCircle className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={20} />
             <div className="text-sm text-indigo-900 dark:text-indigo-200">
               <p className="font-semibold mb-1">Format Requirement</p>
               <p>Please upload a JSON file containing an array of question objects. You can now optionally include a "difficulty" field ("easy", "medium", "hard").</p>
             </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={downloadTemplate}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Download size={16} />
              Download Template (.json)
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
            <input 
              type="file" 
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none">
              <UploadCloud className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">Click to upload JSON</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Supports JSON (Excel requires server-side processing)</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;