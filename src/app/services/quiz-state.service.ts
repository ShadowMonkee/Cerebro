import { Injectable } from '@angular/core';
import { Question, UserAnswer, QuizResult, MultipleChoiceQuestion, TrueFalseQuestion } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class QuizStateService {
  private questions: Question[] = [];
  private answers: Map<string, UserAnswer> = new Map();
  private _currentIndex = 0;
  private _topicId = '';

  /** Initialize a new quiz session */
  startQuiz(topicId: string, questions: Question[]): void {
    this._topicId = topicId;
    this.questions = [...questions];
    this.answers = new Map();
    this._currentIndex = 0;
  }

  get topicId(): string {
    return this._topicId;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get currentQuestion(): Question | null {
    return this.questions[this._currentIndex] ?? null;
  }

  get isFirstQuestion(): boolean {
    return this._currentIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this._currentIndex === this.questions.length - 1;
  }

  get hasActiveQuiz(): boolean {
    return this.questions.length > 0;
  }

  get progressPercent(): number {
    if (this.questions.length === 0) return 0;
    return ((this._currentIndex + 1) / this.questions.length) * 100;
  }

  /** Get the user's answer for the current question */
  getCurrentAnswer(): UserAnswer {
    const q = this.currentQuestion;
    if (!q) return null;
    return this.answers.get(q.id) ?? null;
  }

  /** Set answer for the current question */
  setAnswer(answer: UserAnswer): void {
    const q = this.currentQuestion;
    if (!q) return;
    this.answers.set(q.id, answer);
  }

  /** Navigate to next question */
  next(): boolean {
    if (this._currentIndex < this.questions.length - 1) {
      this._currentIndex++;
      return true;
    }
    return false;
  }

  /** Navigate to previous question */
  prev(): boolean {
    if (this._currentIndex > 0) {
      this._currentIndex--;
      return true;
    }
    return false;
  }

  /** Check how many questions are answered */
  get answeredCount(): number {
    return Array.from(this.answers.values()).filter(a => a !== null).length;
  }

  get allAnswered(): boolean {
    return this.answeredCount === this.questions.length;
  }

  /** Compute results for the review page */
  computeResults(): QuizResult[] {
    return this.questions.map(q => {
      const userAnswer = this.answers.get(q.id) ?? null;
      let isCorrect = false;

      if (q.type === 'multiple-choice') {
        isCorrect = userAnswer === (q as MultipleChoiceQuestion).correctIndex;
      } else if (q.type === 'true-false') {
        isCorrect = userAnswer === (q as TrueFalseQuestion).correctAnswer;
      }

      return {
        questionId: q.id,
        question: q,
        userAnswer,
        isCorrect
      };
    });
  }

  /** Get score as a percentage */
  computeScore(): number {
    const results = this.computeResults();
    if (results.length === 0) return 0;
    const correct = results.filter(r => r.isCorrect).length;
    return Math.round((correct / results.length) * 100);
  }

  /** Reset the quiz */
  reset(): void {
    this.questions = [];
    this.answers = new Map();
    this._currentIndex = 0;
    this._topicId = '';
  }
}
