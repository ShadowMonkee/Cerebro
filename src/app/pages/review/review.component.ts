import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { QuizStateService } from '../../services/quiz-state.service';
import { ProgressService } from '../../services/progress.service';
import { QuizResult, MultipleChoiceQuestion, TrueFalseQuestion } from '../../models/topic.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="review-page" *ngIf="results.length > 0">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/" class="breadcrumb-link">Topics</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Review</span>
      </div>

      <!-- Score Summary -->
      <div class="score-panel">
        <div class="score-label">Your score</div>
        <div class="score-big" [class.great]="score >= 80" [class.ok]="score >= 50 && score < 80" [class.bad]="score < 50">
          {{ correctCount }} / {{ results.length }}
        </div>
        <div class="score-percent" [class.great]="score >= 80" [class.ok]="score >= 50 && score < 80" [class.bad]="score < 50">
          {{ score }}%
        </div>

        <!-- Mini bar visualization -->
        <div class="score-bar">
          <span
            *ngFor="let r of results"
            class="score-pip"
            [class.correct]="r.isCorrect"
            [class.wrong]="!r.isCorrect"
          ></span>
        </div>

        <div class="score-saved">Saved to progress</div>

        <div class="review-actions">
          <a [routerLink]="['/topic', topicId, 'learn']" class="btn btn-ghost">
            ← Study Again
          </a>
          <button class="btn btn-primary" (click)="retakeTest()">
            Retake Test
          </button>
          <a routerLink="/" class="btn btn-ghost">
            All Topics
          </a>
        </div>
      </div>

      <!-- Question Reviews -->
      <div class="questions-review">
        <div
          *ngFor="let r of results; let i = index"
          class="review-item"
          [class.is-correct]="r.isCorrect"
          [class.is-wrong]="!r.isCorrect"
        >
          <div class="review-header">
            <div class="review-icon" [class.pass]="r.isCorrect" [class.fail]="!r.isCorrect">
              {{ r.isCorrect ? '✓' : '✗' }}
            </div>
            <div class="review-meta">
              <span class="review-qnum">Question {{ i + 1 }}</span>
              <p class="review-qtext">{{ r.question.text }}</p>
            </div>
          </div>

          <!-- Answer comparison -->
          <div class="answer-row">
            <ng-container *ngIf="r.question.type === 'multiple-choice'">
              <span
                class="answer-chip"
                [class.yours-wrong]="!r.isCorrect"
                [class.yours-right]="r.isCorrect"
              >
                Your answer: {{ getMCOptionText(r) }}
              </span>
              <span class="answer-chip correct-answer" *ngIf="!r.isCorrect">
                Correct: {{ getCorrectMCText(r) }}
              </span>
            </ng-container>

            <ng-container *ngIf="r.question.type === 'true-false'">
              <span
                class="answer-chip"
                [class.yours-wrong]="!r.isCorrect"
                [class.yours-right]="r.isCorrect"
              >
                Your answer: {{ r.userAnswer === true ? 'True' : 'False' }}
              </span>
              <span class="answer-chip correct-answer" *ngIf="!r.isCorrect">
                Correct: {{ getTFCorrect(r) ? 'True' : 'False' }}
              </span>
            </ng-container>
          </div>

          <!-- Explanation -->
          <div class="explanation theory-content" [innerHTML]="r.question.explanation"></div>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div class="no-results" *ngIf="results.length === 0">
      <p>No quiz results to display.</p>
      <p class="no-results-hint">Complete a test first to see your review.</p>
      <a routerLink="/" class="btn" style="margin-top: 1rem;">Back to Topics</a>
    </div>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .breadcrumb-link { color: var(--text-muted); }
    .breadcrumb-link:hover { color: var(--accent); }
    .breadcrumb-sep { color: var(--bg-border); }
    .breadcrumb-current { color: var(--text-primary); }

    /* Score Panel */
    .score-panel {
      background: var(--bg-surface);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .score-label {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .score-big {
      font-family: var(--font-mono);
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .score-big.great { color: var(--success); }
    .score-big.ok { color: var(--warning); }
    .score-big.bad { color: var(--danger); }

    .score-percent {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .score-percent.great { color: var(--success); }
    .score-percent.ok { color: var(--warning); }
    .score-percent.bad { color: var(--danger); }

    .score-bar {
      display: flex;
      gap: 4px;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .score-pip {
      width: 24px;
      height: 6px;
      border-radius: 3px;
    }

    .score-pip.correct { background: var(--success); }
    .score-pip.wrong { background: var(--danger); }

    .score-saved {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .review-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Question Reviews */
    .questions-review {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-item {
      background: var(--bg-surface);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      border-left: 3px solid transparent;
    }

    .review-item.is-correct {
      border-left-color: var(--success);
    }

    .review-item.is-wrong {
      border-left-color: var(--danger);
    }

    .review-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .review-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .review-icon.pass {
      background: var(--success-dim);
      color: var(--success);
    }

    .review-icon.fail {
      background: var(--danger-dim);
      color: var(--danger);
    }

    .review-qnum {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--red);
      font-weight: 500;
    }

    .review-qtext {
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 1.4;
      margin-top: 0.125rem;
    }

    .answer-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      padding-left: 2.25rem;
    }

    .answer-chip {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-weight: 500;
    }

    .answer-chip.yours-wrong {
      background: var(--danger-dim);
      color: var(--danger);
      text-decoration: line-through;
    }

    .answer-chip.yours-right {
      background: var(--success-dim);
      color: var(--success);
    }

    .answer-chip.correct-answer {
      background: var(--success-dim);
      color: var(--success);
    }

    .explanation {
      margin-left: 2.25rem;
      padding: 0.75rem 1rem;
      background: var(--bg-raised);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
    }

    /* No Results */
    .no-results {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .no-results-hint {
      font-size: 0.8125rem;
      margin-top: 0.5rem;
    }
  `]
})
export class ReviewComponent implements OnInit {
  results: QuizResult[] = [];
  score = 0;
  correctCount = 0;
  topicId = '';

  constructor(
    private quizState: QuizStateService,
    private progressService: ProgressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('id') || this.quizState.topicId;

    if (this.quizState.hasActiveQuiz) {
      this.results = this.quizState.computeResults();
      this.score = this.quizState.computeScore();
      this.correctCount = this.results.filter(r => r.isCorrect).length;
    }
  }

  getMCOptionText(r: QuizResult): string {
    const q = r.question as MultipleChoiceQuestion;
    if (r.userAnswer === null || r.userAnswer === undefined) return 'Skipped';
    return q.options[r.userAnswer as number] ?? 'Unknown';
  }

  getCorrectMCText(r: QuizResult): string {
    const q = r.question as MultipleChoiceQuestion;
    return q.options[q.correctIndex] ?? 'Unknown';
  }

  getTFCorrect(r: QuizResult): boolean {
    return (r.question as TrueFalseQuestion).correctAnswer;
  }

  retakeTest(): void {
    // Re-navigate to test — the quiz state is still in memory
    // We need to restart it
    if (this.quizState.hasActiveQuiz) {
      const questions = this.results.map(r => r.question);
      this.quizState.startQuiz(this.topicId, questions);
      this.router.navigate(['/topic', this.topicId, 'test']);
    } else {
      this.router.navigate(['/topic', this.topicId, 'learn']);
    }
  }
}
