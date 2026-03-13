import { Injectable } from '@angular/core';
import { CerebroProgress, TopicProgress, WrongQuestion, QuizResult, MultipleChoiceQuestion, TrueFalseQuestion } from '../models/topic.model';

const STORAGE_KEY = 'cerebro';

@Injectable({ providedIn: 'root' })
export class ProgressService {

  /** Read all progress data from localStorage */
  getAll(): CerebroProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /** Get progress for a single topic */
  getTopicProgress(topicId: string): TopicProgress | null {
    const all = this.getAll();
    return all[topicId] ?? null;
  }

  /** Save quiz results for a topic */
  saveResults(topicId: string, score: number, results: QuizResult[]): void {
    const all = this.getAll();
    const existing = all[topicId];
    const now = new Date().toISOString();

    // Build wrong questions list
    const wrongQuestions: WrongQuestion[] = results
      .filter(r => !r.isCorrect)
      .map(r => {
        let correctAnswer: number | boolean;
        if (r.question.type === 'multiple-choice') {
          correctAnswer = (r.question as MultipleChoiceQuestion).correctIndex;
        } else {
          correctAnswer = (r.question as TrueFalseQuestion).correctAnswer;
        }

        return {
          questionId: r.questionId,
          yourAnswer: r.userAnswer as number | boolean,
          correctAnswer,
          timestamp: now
        };
      });

    const updated: TopicProgress = {
      completed: true,
      bestScore: existing ? Math.max(existing.bestScore, score) : score,
      lastAttempt: now,
      attempts: existing ? existing.attempts + 1 : 1,
      wrongQuestions
    };

    all[topicId] = updated;
    this.save(all);
  }

  /** Mark a topic as "in progress" (started learning but hasn't tested yet) */
  markStarted(topicId: string): void {
    const all = this.getAll();
    if (!all[topicId]) {
      all[topicId] = {
        completed: false,
        bestScore: 0,
        lastAttempt: '',
        attempts: 0,
        wrongQuestions: []
      };
      this.save(all);
    }
  }

  /** Get the status label for a topic */
  getStatus(topicId: string): 'new' | 'progress' | 'done' {
    const progress = this.getTopicProgress(topicId);
    if (!progress) return 'new';
    if (progress.completed) return 'done';
    return 'progress';
  }

  /** Clear all progress */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Clear progress for a single topic */
  clearTopic(topicId: string): void {
    const all = this.getAll();
    delete all[topicId];
    this.save(all);
  }

  private save(data: CerebroProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Cerebro: Failed to save progress', e);
    }
  }
}
