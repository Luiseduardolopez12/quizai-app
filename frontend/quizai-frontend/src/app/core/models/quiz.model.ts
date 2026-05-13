export interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  teacher: string;
  questions: Question[];
  timeLimit: number;
  isPublished: boolean;
  sourceFile: string;
  createdAt: string;
}