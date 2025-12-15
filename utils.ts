import { AppData, Category, Question, Option, Difficulty } from './types';

const STORAGE_KEY = 'quiz_master_v2'; // Bump version to ensure clean slate or handle migration if needed

const INITIAL_DATA: AppData = {
  categories: [
    {
      id: 'cat_1',
      name: 'General Knowledge',
      description: 'Test your general awareness with these common questions.',
      createdAt: Date.now(),
    },
    {
      id: 'cat_2',
      name: 'Web Development',
      description: 'Questions about HTML, CSS, React, and TypeScript.',
      createdAt: Date.now(),
    }
  ],
  questions: {
    'cat_1': [
      {
        id: 'q1',
        text: 'What is the capital of France?',
        options: [
          { id: 'opt1', text: 'London' },
          { id: 'opt2', text: 'Berlin' },
          { id: 'opt3', text: 'Paris' },
          { id: 'opt4', text: 'Madrid' },
        ],
        correctOptionId: 'opt3',
        difficulty: 'easy'
      },
      {
        id: 'q2',
        text: 'Which planet is known as the Red Planet?',
        options: [
          { id: 'opt1', text: 'Venus' },
          { id: 'opt2', text: 'Mars' },
          { id: 'opt3', text: 'Jupiter' },
          { id: 'opt4', text: 'Saturn' },
          { id: 'opt5', text: 'Mercury' },
        ],
        correctOptionId: 'opt2',
        difficulty: 'easy'
      }
    ],
    'cat_2': [
      {
        id: 'q3',
        text: 'Which hook is used to handle side effects in React?',
        options: [
          { id: 'opt1', text: 'useState' },
          { id: 'opt2', text: 'useEffect' },
          { id: 'opt3', text: 'useContext' },
          { id: 'opt4', text: 'useReducer' },
        ],
        correctOptionId: 'opt2',
        difficulty: 'medium'
      }
    ]
  },
  results: [],
  incorrectRecords: [],
};

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_DATA;
    
    const parsed = JSON.parse(data);
    // Migration safety: ensure new fields exist if loading old data
    if (!parsed.incorrectRecords) parsed.incorrectRecords = [];
    return parsed;
  } catch (e) {
    console.error("Failed to load data", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Simple JSON Validator and Parser
export const parseQuestionsFile = async (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let data: any;
        
        if (file.name.endsWith('.json')) {
           data = JSON.parse(text);
        } else {
           reject(new Error("Only JSON files are fully supported in this demo. Please upload a .json file."));
           return;
        }

        if (!Array.isArray(data)) {
          reject(new Error("File content must be an array of questions"));
          return;
        }

        // Validate structure
        const validQuestions: Question[] = data.map((item: any, index) => {
          if (!item.text || !Array.isArray(item.options) || !item.correctOptionId) {
             throw new Error(`Item at index ${index} is missing required fields (text, options, correctOptionId)`);
          }
          
          // Validate difficulty if present
          let diff: Difficulty | undefined = undefined;
          if (item.difficulty && ['easy', 'medium', 'hard'].includes(item.difficulty)) {
            diff = item.difficulty as Difficulty;
          }

          return {
            id: item.id || generateId(),
            text: item.text,
            options: item.options.map((opt: any, i: number) => ({
              id: opt.id || `opt_${i}`,
              text: opt.text || String(opt)
            })),
            correctOptionId: item.correctOptionId,
            explanation: item.explanation,
            difficulty: diff
          };
        });

        resolve(validQuestions);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export const downloadTemplate = () => {
  const template = [
    {
      "text": "Example Question?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"}
      ],
      "correctOptionId": "b",
      "explanation": "Optional explanation here",
      "difficulty": "medium"
    }
  ];
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quiz_template.json';
  a.click();
  URL.revokeObjectURL(url);
};