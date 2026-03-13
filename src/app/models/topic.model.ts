/* ============================================
   CEREBRO — Data Models
   ============================================ */

export interface TopicSection {
  title: string;
  content: string; // Raw HTML
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string; // Raw HTML
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true-false';
  text: string;
  correctAnswer: boolean;
  explanation: string; // Raw HTML
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion;

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;   // Matches a Category.id from the index
  tags: string[];      // Optional finer-grained labels
  sections: TopicSection[];
  questions: Question[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;      // Hex color for filter pills and accents
}

export interface TopicIndex {
  categories: Category[];
  topics: string[];    // Array of topic filenames (without .json)
}

/* --- Progress / localStorage Models --- */

export interface WrongQuestion {
  questionId: string;
  yourAnswer: number | boolean;
  correctAnswer: number | boolean;
  timestamp: string;
}

export interface TopicProgress {
  completed: boolean;
  bestScore: number; // percentage 0-100
  lastAttempt: string; // ISO date
  attempts: number;
  wrongQuestions: WrongQuestion[];
}

export interface CerebroProgress {
  [topicId: string]: TopicProgress;
}

/* --- Quiz State (in-memory) --- */

export type UserAnswer = number | boolean | null;

export interface QuizResult {
  questionId: string;
  question: Question;
  userAnswer: UserAnswer;
  isCorrect: boolean;
}
