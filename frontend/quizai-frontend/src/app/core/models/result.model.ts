export interface Answer {
  questionIndex: number;
  questionText: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface Result {
  score: number;
  totalQuestions: number;
  correctCount: number;
  answers: Answer[];
}

export interface ReviewTopic {
  topic: string;
  explanation: string;
  example: string;
  practiceQuestion: string;
  practiceAnswer: string;
}

export interface ReviewMaterial {
  summary: string;
  topics: ReviewTopic[];
}

export interface SubmitResult {
  message: string;
  result: Result;
  reviewMaterial: ReviewMaterial;
}