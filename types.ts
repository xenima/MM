export enum ViewState {
  HOME = 'HOME',
  QUIZ_SETUP = 'QUIZ_SETUP', // Used for modal state mostly, but good to keep
  QUIZ_ACTIVE = 'QUIZ_ACTIVE',
  RESULT = 'RESULT',
  INCORRECT_NOTE = 'INCORRECT_NOTE', // New View
  LOGIN = 'LOGIN',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_DATA = 'ADMIN_DATA',
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation?: string;
  difficulty?: Difficulty; // New field
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface QuizResult {
  id: string;
  categoryId: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  answers: Record<string, string>;
  timeSpentSeconds: number;
}

export interface IncorrectRecord {
  questionId: string;
  categoryId: string;
  timestamp: number;
}

export interface AppData {
  categories: Category[];
  questions: Record<string, Question[]>;
  results: QuizResult[];
  incorrectRecords: IncorrectRecord[]; // New field
}