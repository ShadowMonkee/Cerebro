import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { ProgressService } from '../../services/progress.service';
import { Topic, Category } from '../../models/topic.model';

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

      <ng-container *ngIf="!loading && !error">
        <!-- Category Filter Bar -->
        <div class="filter-bar" *ngIf="categories.length > 0">
          <button
            class="filter-pill"
            [class.active]="activeCategory === 'all'"
            (click)="filterBy('all')"
          >
            All
            <span class="pill-count">{{ topics.length }}</span>
          </button>
          <button
            *ngFor="let cat of categories"
            class="filter-pill"
            [class.active]="activeCategory === cat.id"
            [style.--pill-color]="cat.color"
            (click)="filterBy(cat.id)"
          >
            <span class="pill-icon">{{ cat.icon }}</span>
            {{ cat.label }}
            <span class="pill-count">{{ countByCategory(cat.id) }}</span>
          </button>
        </div>

        <!-- Topic Grid -->
        <div class="topic-grid" *ngIf="filteredTopics.length > 0">
          <a
            *ngFor="let topic of filteredTopics"
            [routerLink]="['/topic', topic.id, 'learn']"
            class="topic-card"
            [style.--card-accent]="getCategoryColor(topic.category)"
          >
            <div class="card-icon">{{ topic.icon }}</div>
            <div class="card-body">
              <div class="card-top-row">
                <h2 class="card-title">{{ topic.title }}</h2>
                <span
                  class="category-tag"
                  [style.--tag-color]="getCategoryColor(topic.category)"
                >{{ getCategoryLabel(topic.category) }}</span>
              </div>
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

        <!-- Empty State (no topics at all) -->
        <div class="empty-state" *ngIf="topics.length === 0">
          <p class="empty-text">No topics found.</p>
          <p class="empty-hint">Add JSON files to <code>assets/topics/</code> and update <code>topics-index.json</code>.</p>
        </div>

        <!-- Filtered Empty State (topics exist but none match filter) -->
        <div class="empty-state" *ngIf="topics.length > 0 && filteredTopics.length === 0">
          <p class="empty-text">No topics in this category yet.</p>
          <button class="btn" (click)="filterBy('all')">Show all topics</button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 1.5rem;
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

    /* --- Filter Bar --- */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 0.5px solid var(--bg-border);
    }

    .filter-pill {
      --pill-color: var(--accent);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.375rem 0.875rem;
      border-radius: 999px;
      border: 0.5px solid var(--bg-border);
      background: var(--bg-surface);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .filter-pill:hover {
      border-color: var(--pill-color);
      color: var(--text-primary);
      background: var(--bg-raised);
    }

    .filter-pill.active {
      border-color: var(--pill-color);
      background: color-mix(in srgb, var(--pill-color) 12%, transparent);
      color: var(--pill-color);
    }

    .pill-icon {
      font-size: 0.8125rem;
      line-height: 1;
    }

    .pill-count {
      font-size: 0.625rem;
      background: var(--bg-border);
      color: var(--text-muted);
      padding: 0.0625rem 0.375rem;
      border-radius: 999px;
      min-width: 1.125rem;
      text-align: center;
    }

    .filter-pill.active .pill-count {
      background: color-mix(in srgb, var(--pill-color) 25%, transparent);
      color: var(--pill-color);
    }

    /* --- Topic Grid --- */
    .topic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .topic-card {
      --card-accent: var(--accent);
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
      border-color: var(--card-accent);
      transform: translateY(-2px);
      color: var(--text-primary);
    }

    .topic-card:hover::before {
      background: linear-gradient(90deg, var(--red), var(--card-accent));
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

    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .card-title {
      font-family: var(--font-mono);
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .category-tag {
      --tag-color: var(--accent);
      font-family: var(--font-mono);
      font-size: 0.5625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tag-color);
      background: color-mix(in srgb, var(--tag-color) 12%, transparent);
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
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
  filteredTopics: Topic[] = [];
  categories: Category[] = [];
  activeCategory = 'all';
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

    // Load categories
    this.topicService.getCategories().subscribe({
      next: categories => this.categories = categories,
      error: () => {} // Non-critical, filter bar just won't show
    });

    // Load topics
    this.topicService.getAllTopics().subscribe({
      next: topics => {
        this.topics = topics;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load topics. Check that your JSON files are in place.';
        this.loading = false;
      }
    });
  }

  filterBy(categoryId: string): void {
    this.activeCategory = categoryId;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeCategory === 'all') {
      this.filteredTopics = [...this.topics];
    } else {
      this.filteredTopics = this.topics.filter(t => t.category === this.activeCategory);
    }
  }

  countByCategory(categoryId: string): number {
    return this.topics.filter(t => t.category === categoryId).length;
  }

  getCategoryColor(categoryId: string): string {
    const cat = this.categories.find(c => c.id === categoryId);
    return cat?.color ?? 'var(--accent)';
  }

  getCategoryLabel(categoryId: string): string {
    const cat = this.categories.find(c => c.id === categoryId);
    return cat?.label ?? categoryId;
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
