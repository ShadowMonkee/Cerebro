import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { ProgressService } from '../../services/progress.service';
import { QuizStateService } from '../../services/quiz-state.service';
import { Topic } from '../../models/topic.model';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="learn-page" *ngIf="topic">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/" class="breadcrumb-link">Topics</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ topic.title }}</span>
      </div>

      <!-- Topic Header -->
      <header class="learn-header">
        <span class="topic-icon">{{ topic.icon }}</span>
        <div>
          <h1 class="learn-title">{{ topic.title }}</h1>
          <p class="learn-desc">{{ topic.description }}</p>
        </div>
      </header>

      <!-- Section Content -->
      <div class="section-panel">
        <div class="section-top">
          <h2 class="section-title">{{ currentSection.title }}</h2>
          <span class="section-counter">Section {{ currentIndex + 1 }} / {{ topic.sections.length }}</span>
        </div>

        <div class="section-body theory-content" [innerHTML]="currentSection.content"></div>

        <!-- Navigation -->
        <div class="section-nav">
          <button
            class="btn btn-ghost"
            [disabled]="currentIndex === 0"
            (click)="prevSection()"
          >
            ← Prev
          </button>

          <div class="dots">
            <span
              *ngFor="let section of topic.sections; let i = index"
              class="dot"
              [class.active]="i === currentIndex"
              [class.visited]="i < currentIndex"
              (click)="goToSection(i)"
            ></span>
          </div>

          <button
            *ngIf="!isLastSection"
            class="btn btn-primary"
            (click)="nextSection()"
          >
            Next →
          </button>

          <button
            *ngIf="isLastSection"
            class="btn btn-primary btn-start-test"
            (click)="startTest()"
          >
            Start Test →
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading" *ngIf="!topic && !error">
      <div class="loading-spinner"></div>
      <span>Loading topic...</span>
    </div>

    <!-- Error -->
    <div class="error-state" *ngIf="error">
      <p>{{ error }}</p>
      <a routerLink="/" class="btn">Back to Topics</a>
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

    .breadcrumb-link {
      color: var(--text-muted);
    }

    .breadcrumb-link:hover {
      color: var(--accent);
    }

    .breadcrumb-sep {
      color: var(--bg-border);
    }

    .breadcrumb-current {
      color: var(--text-primary);
    }

    .learn-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .topic-icon {
      font-size: 2rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .learn-title {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .learn-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .section-panel {
      background: var(--bg-surface);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .section-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 0.5px solid var(--bg-border);
    }

    .section-title {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 600;
    }

    .section-counter {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--red);
      font-weight: 500;
    }

    .section-body {
      margin-bottom: 1.5rem;
      min-height: 150px;
    }

    .section-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 0.5px solid var(--bg-border);
    }

    .dots {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--bg-border);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .dot:hover {
      background: var(--text-muted);
    }

    .dot.active {
      background: var(--accent);
      transform: scale(1.25);
    }

    .dot.visited {
      background: var(--text-muted);
    }

    .btn-start-test {
      background: var(--red);
      border-color: var(--red);
    }

    .btn-start-test:hover {
      background: #f9a8a8;
      border-color: #f9a8a8;
    }

    /* Loading & Error */
    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: center;
      padding: 3rem 0;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--bg-border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .error-state .btn {
      margin-top: 1rem;
    }
  `]
})
export class LearnComponent implements OnInit {
  topic: Topic | null = null;
  currentIndex = 0;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicService: TopicService,
    private progressService: ProgressService,
    private quizState: QuizStateService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No topic ID provided.';
      return;
    }

    this.topicService.getTopic(id).subscribe({
      next: topic => {
        this.topic = topic;
        this.progressService.markStarted(topic.id);
      },
      error: () => {
        this.error = 'Failed to load topic.';
      }
    });
  }

  get currentSection() {
    return this.topic!.sections[this.currentIndex];
  }

  get isLastSection(): boolean {
    return this.currentIndex === this.topic!.sections.length - 1;
  }

  nextSection(): void {
    if (this.currentIndex < this.topic!.sections.length - 1) {
      this.currentIndex++;
      this.scrollToTop();
    }
  }

  prevSection(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToTop();
    }
  }

  goToSection(index: number): void {
    this.currentIndex = index;
    this.scrollToTop();
  }

  startTest(): void {
    if (this.topic) {
      this.quizState.startQuiz(this.topic.id, this.topic.questions);
      this.router.navigate(['/topic', this.topic.id, 'test']);
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
