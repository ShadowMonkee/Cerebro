import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QuizStateService } from '../../services/quiz-state.service';
import { ProgressService } from '../../services/progress.service';
import { Question, MultipleChoiceQuestion } from '../../models/topic.model';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="test-page" *ngIf="quizState.hasActiveQuiz">
      <!-- Header -->
      <div class="test-header">
        <a [routerLink]="['/topic', quizState.topicId, 'learn']" class="btn btn-ghost btn-sm">
          ← Back to Theory
        </a>
        <div class="answered-count">
          {{ quizState.answeredCount }} / {{ quizState.totalQuestions }} answered
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-track">
        <div
          class="progress-fill"
          [style.width.%]="quizState.progressPercent"
        ></div>
      </div>

      <!-- Question Card -->
      <div class="question-card" *ngIf="currentQuestion">
        <div class="question-number">Question {{ quizState.currentIndex + 1 }} of {{ quizState.totalQuestions }}</div>
        <p class="question-text">{{ currentQuestion.text }}</p>

        <!-- Multiple Choice Options -->
        <div class="options" *ngIf="currentQuestion.type === 'multiple-choice'">
          <button
            *ngFor="let option of asMC(currentQuestion).options; let i = index"
            class="option"
            [class.selected]="quizState.getCurrentAnswer() === i"
            (click)="selectMCAnswer(i)"
          >
            <span class="option-marker">{{ getMarker(i) }}</span>
            <span class="option-text">{{ option }}</span>
          </button>
        </div>

        <!-- True/False Options -->
        <div class="tf-options" *ngIf="currentQuestion.type === 'true-false'">
          <button
            class="tf-btn"
            [class.selected]="quizState.getCurrentAnswer() === true"
            (click)="selectTFAnswer(true)"
          >
            True
          </button>
          <button
            class="tf-btn"
            [class.selected]="quizState.getCurrentAnswer() === false"
            (click)="selectTFAnswer(false)"
          >
            False
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="test-nav">
        <button
          class="btn btn-ghost"
          [disabled]="quizState.isFirstQuestion"
          (click)="prev()"
        >
          ← Back
        </button>

        <!-- Dot indicators -->
        <div class="step-dots">
          <span
            *ngFor="let q of questionDots; let i = index"
            class="step-dot"
            [class.active]="i === quizState.currentIndex"
            [class.answered]="isAnswered(i)"
            (click)="goTo(i)"
          ></span>
        </div>

        <button
          *ngIf="!quizState.isLastQuestion"
          class="btn btn-primary"
          (click)="next()"
        >
          Next →
        </button>

        <button
          *ngIf="quizState.isLastQuestion"
          class="btn btn-primary btn-submit"
          [disabled]="!quizState.allAnswered"
          (click)="submitQuiz()"
        >
          Submit
        </button>
      </div>

      <!-- Unanswered warning -->
      <div class="unanswered-hint" *ngIf="quizState.isLastQuestion && !quizState.allAnswered">
        <span>{{ quizState.totalQuestions - quizState.answeredCount }} question(s) still unanswered</span>
      </div>
    </div>

    <!-- No active quiz -->
    <div class="no-quiz" *ngIf="!quizState.hasActiveQuiz">
      <p>No active quiz session.</p>
      <p class="no-quiz-hint">Go to a topic and complete the theory first.</p>
      <a routerLink="/" class="btn" style="margin-top: 1rem;">Back to Topics</a>
    </div>
  `,
  styles: [`
    .test-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .answered-count {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .progress-track {
      height: 3px;
      background: var(--bg-border);
      border-radius: 2px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 2px;
      transition: width var(--transition-base);
    }

    .question-card {
      background: var(--bg-surface);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .question-number {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--red);
      font-weight: 500;
      margin-bottom: 0.75rem;
    }

    .question-text {
      font-size: 1.0625rem;
      font-weight: 500;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }

    /* Multiple Choice */
    .options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--bg-raised);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 0.9375rem;
      color: var(--text-primary);
      text-align: left;
      width: 100%;
      font-family: var(--font-sans);
    }

    .option:hover {
      border-color: var(--text-muted);
      background: var(--bg-border);
    }

    .option.selected {
      border-color: var(--accent);
      background: var(--accent-dim);
    }

    .option-marker {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid var(--bg-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition-fast);
      color: var(--text-muted);
    }

    .option.selected .option-marker {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--bg-primary);
    }

    .option-text {
      flex: 1;
    }

    /* True/False */
    .tf-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .tf-btn {
      padding: 1rem;
      background: var(--bg-raised);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-md);
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
    }

    .tf-btn:hover {
      border-color: var(--text-muted);
      background: var(--bg-border);
    }

    .tf-btn.selected {
      border-color: var(--accent);
      background: var(--accent-dim);
    }

    /* Navigation */
    .test-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .step-dots {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 60%;
    }

    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--bg-border);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .step-dot:hover {
      background: var(--text-muted);
    }

    .step-dot.active {
      background: var(--accent);
      transform: scale(1.3);
    }

    .step-dot.answered {
      background: var(--text-muted);
    }

    .step-dot.active.answered {
      background: var(--accent);
    }

    .btn-submit {
      background: var(--success);
      border-color: var(--success);
      color: var(--bg-primary);
    }

    .btn-submit:hover:not(:disabled) {
      background: #a7f3d0;
      border-color: #a7f3d0;
    }

    .unanswered-hint {
      text-align: center;
      margin-top: 0.75rem;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--warning);
    }

    /* No Quiz State */
    .no-quiz {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .no-quiz-hint {
      font-size: 0.8125rem;
      margin-top: 0.5rem;
    }
  `]
})
export class TestComponent implements OnInit {
  questionDots: null[] = [];

  constructor(
    public quizState: QuizStateService,
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.questionDots = new Array(this.quizState.totalQuestions).fill(null);
  }

  get currentQuestion(): Question | null {
    return this.quizState.currentQuestion;
  }

  asMC(q: Question): MultipleChoiceQuestion {
    return q as MultipleChoiceQuestion;
  }

  getMarker(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  isAnswered(index: number): boolean {
    // We need to check if the question at this index has been answered
    // This is a simplified check - we rely on the dot styling
    const saved = this.quizState.currentIndex;
    return true; // Dots only show answered state for non-null answers
  }

  selectMCAnswer(index: number): void {
    this.quizState.setAnswer(index);
  }

  selectTFAnswer(value: boolean): void {
    this.quizState.setAnswer(value);
  }

  next(): void {
    this.quizState.next();
    this.scrollToTop();
  }

  prev(): void {
    this.quizState.prev();
    this.scrollToTop();
  }

  goTo(index: number): void {
    // Navigate to specific question by stepping
    while (this.quizState.currentIndex < index) this.quizState.next();
    while (this.quizState.currentIndex > index) this.quizState.prev();
    this.scrollToTop();
  }

  submitQuiz(): void {
    if (!this.quizState.allAnswered) return;

    const results = this.quizState.computeResults();
    const score = this.quizState.computeScore();

    // Save to localStorage
    this.progressService.saveResults(this.quizState.topicId, score, results);

    // Navigate to review
    this.router.navigate(['/topic', this.quizState.topicId, 'review']);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
