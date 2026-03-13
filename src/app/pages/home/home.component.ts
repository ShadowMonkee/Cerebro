import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { ProgressService } from '../../services/progress.service';
import { Topic } from '../../models/topic.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <header class="page-header">
        <h1 class="page-title">Topics</h1>
        <p class="page-subtitle">Choose a topic to study</p>
      </header>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="loading-spinner"></div>
        <span>Loading topics...</span>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>{{ error }}</p>
        <button class="btn" (click)="loadTopics()">Retry</button>
      </div>

      <!-- Topic Grid -->
      <div class="topic-grid" *ngIf="!loading && !error">
        <a
          *ngFor="let topic of topics"
          [routerLink]="['/topic', topic.id, 'learn']"
          class="topic-card"
        >
          <div class="card-icon">{{ topic.icon }}</div>
          <div class="card-body">
            <h2 class="card-title">{{ topic.title }}</h2>
            <p class="card-desc">{{ topic.description }}</p>
            <div class="card-meta">
              <span
                class="badge"
                [ngClass]="{
                  'badge-done': getStatus(topic.id) === 'done',
                  'badge-progress': getStatus(topic.id) === 'progress',
                  'badge-new': getStatus(topic.id) === 'new'
                }"
              >
                {{ getStatusLabel(topic.id) }}
              </span>
              <span class="meta-info">
                <span class="meta-item">{{ topic.sections.length }} sections</span>
                <span class="meta-dot">·</span>
                <span class="meta-item">{{ topic.questions.length }} questions</span>
              </span>
            </div>
            <div class="card-score" *ngIf="getStatus(topic.id) === 'done'">
              <span class="score-label">Best:</span>
              <span class="score-value">{{ getBestScore(topic.id) }}%</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && !error && topics.length === 0">
        <p class="empty-text">No topics found.</p>
        <p class="empty-hint">Add JSON files to <code>assets/topics/</code> and update <code>topics-index.json</code>.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-family: var(--font-mono);
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .topic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .topic-card {
      background: var(--bg-surface);
      border: 0.5px solid var(--bg-border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      text-decoration: none;
      color: var(--text-primary);
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;
    }

    .topic-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: transparent;
      transition: background var(--transition-base);
    }

    .topic-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      color: var(--text-primary);
    }

    .topic-card:hover::before {
      background: linear-gradient(90deg, var(--red), var(--accent));
    }

    .card-icon {
      font-size: 1.75rem;
      flex-shrink: 0;
      line-height: 1;
      padding-top: 0.125rem;
    }

    .card-body {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      font-family: var(--font-mono);
      font-size: 0.9375rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .card-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .meta-info {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .meta-dot {
      opacity: 0.5;
    }

    .card-score {
      margin-top: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .score-label {
      color: var(--text-muted);
    }

    .score-value {
      color: var(--success);
      font-weight: 600;
    }

    /* Loading */
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

    /* Error & Empty */
    .error-state,
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .empty-hint {
      margin-top: 0.5rem;
      font-size: 0.8125rem;
    }

    .empty-hint code {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      background: var(--bg-raised);
      color: var(--accent);
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 480px) {
      .topic-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  topics: Topic[] = [];
  loading = true;
  error = '';

  constructor(
    private topicService: TopicService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.loading = true;
    this.error = '';
    this.topicService.getAllTopics().subscribe({
      next: topics => {
        this.topics = topics;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load topics. Check that your JSON files are in place.';
        this.loading = false;
      }
    });
  }

  getStatus(topicId: string): string {
    return this.progressService.getStatus(topicId);
  }

  getStatusLabel(topicId: string): string {
    const status = this.progressService.getStatus(topicId);
    switch (status) {
      case 'done': return 'completed';
      case 'progress': return 'in progress';
      default: return 'new';
    }
  }

  getBestScore(topicId: string): number {
    const progress = this.progressService.getTopicProgress(topicId);
    return progress?.bestScore ?? 0;
  }
}
