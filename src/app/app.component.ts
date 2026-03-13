import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <nav class="navbar">
        <div class="container nav-inner">
          <a routerLink="/" class="nav-brand">
            <span class="brand-dot"></span>
            <span class="brand-text">Cerebro</span>
          </a>
          <div class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              Topics
            </a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <div class="container">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: var(--bg-surface);
      border-bottom: 0.5px solid var(--bg-border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      background: rgba(22, 27, 34, 0.85);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text-primary);
    }

    .nav-brand:hover {
      color: var(--text-primary);
    }

    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--red);
      flex-shrink: 0;
    }

    .brand-text {
      font-family: var(--font-mono);
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
    }

    .nav-links a {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      transition: color var(--transition-fast);
      position: relative;
      padding: 0.25rem 0;
    }

    .nav-links a:hover {
      color: var(--text-primary);
    }

    .nav-links a.active {
      color: var(--accent);
    }

    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--red);
      border-radius: 1px;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0 3rem;
    }
  `]
})
export class AppComponent {}
