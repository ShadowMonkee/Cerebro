# 🔴 Cerebro

**A dark, focused study helper tool built with Angular 17+**

Cerebro lets you organize study material into topics with theory sections and quiz questions. Learn the theory, take a test, review your results — all with a slick developer-tool aesthetic.

---

## Features

- **Category filtering** — Filter topics by subject area (Angular, CSS, TypeScript, etc.)
- **Theory viewer** — Paginated HTML content with prev/next navigation and section dots
- **Quiz stepper** — One question at a time, supports multiple choice and true/false
- **Review screen** — Score summary, per-question feedback with explanations
- **Progress tracking** — localStorage persistence for scores, attempts, and wrong questions
- **Dark, focused UI** — JetBrains Mono headings, pastel accents, dev-tool inspired design

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Angular CLI** 17+

### Install & Run

```bash
# Navigate into the project
cd cerebro

# Install dependencies
npm install

# Start the dev server
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Build for Production

```bash
ng build --configuration production
```

Output goes to `dist/cerebro/`.

---

## Adding Your Own Topics

### 1. Create a JSON file

Add a new file to `src/assets/topics/`, e.g. `my-topic.json`:

```json
{
  "id": "my-topic",
  "title": "My Topic",
  "description": "A brief description",
  "icon": "📚",
  "category": "general",
  "tags": ["web", "fundamentals"],
  "sections": [
    {
      "title": "Section Title",
      "content": "<p>HTML theory content here...</p>"
    }
  ],
  "questions": [
    {
      "id": "mt-q1",
      "type": "multiple-choice",
      "text": "Your question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "<p>Why option B is correct...</p>"
    },
    {
      "id": "mt-q2",
      "type": "true-false",
      "text": "A true/false statement.",
      "correctAnswer": false,
      "explanation": "<p>Why this is false...</p>"
    }
  ]
}
```

### 2. Register it in the index

Edit `src/assets/topics/topics-index.json` — add your topic to the `topics` array, and if you used a new category, add it to `categories`:

```json
{
  "categories": [
    { "id": "angular", "label": "Angular", "icon": "📐", "color": "#f87171" },
    { "id": "css", "label": "CSS", "icon": "🎨", "color": "#c4b5fd" },
    { "id": "general", "label": "General Web", "icon": "🌐", "color": "#fcd34d" },
    { "id": "my-category", "label": "My Category", "icon": "🆕", "color": "#86efac" }
  ],
  "topics": [
    "angular-basics",
    "css-fundamentals",
    "rest-apis",
    "my-topic"
  ]
}
```

### 3. Reload the app

That's it — your new topic will appear on the home screen.

---

## Project Structure

```
src/app/
├── app.component.ts          # Shell: navbar + router-outlet
├── app.config.ts             # Provider configuration
├── app.routes.ts             # Route definitions
│
├── models/
│   └── topic.model.ts        # TypeScript interfaces
│
├── services/
│   ├── topic.service.ts      # Fetches & caches topic JSON
│   ├── quiz-state.service.ts # In-memory quiz state management
│   └── progress.service.ts   # localStorage persistence
│
├── pages/
│   ├── home/                 # Topic dashboard (card grid)
│   ├── learn/                # Theory viewer (paginated sections)
│   ├── test/                 # Quiz stepper (one question at a time)
│   └── review/               # Results + explanations
│
src/assets/
└── topics/
    ├── topics-index.json     # Manifest of available topics
    ├── angular-basics.json   # Sample topic
    ├── css-fundamentals.json # Sample topic
    └── rest-apis.json        # Sample topic
```

## Design System

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0d1117` | App background |
| `--bg-surface` | `#161b22` | Cards, panels |
| `--accent` | `#a78bfa` | Purple — interactive elements |
| `--red` | `#f87171` | Red — branding, question numbers |
| `--success` | `#86efac` | Pastel green — correct answers |
| `--danger` | `#fca5a5` | Pastel red — wrong answers |
| `--font-mono` | JetBrains Mono | Headings, badges, code |
| `--font-sans` | Inter | Body text |

## localStorage Schema

```json
{
  "cerebro": {
    "topic-id": {
      "completed": true,
      "bestScore": 85,
      "lastAttempt": "2025-03-12T10:30:00Z",
      "attempts": 3,
      "wrongQuestions": [
        {
          "questionId": "q3",
          "yourAnswer": 0,
          "correctAnswer": 2,
          "timestamp": "2025-03-12T10:30:00Z"
        }
      ]
    }
  }
}
```

## License

MIT
