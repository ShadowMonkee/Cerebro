import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LearnComponent } from './pages/learn/learn.component';
import { TestComponent } from './pages/test/test.component';
import { ReviewComponent } from './pages/review/review.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'topic/:id/learn', component: LearnComponent },
  { path: 'topic/:id/test', component: TestComponent },
  { path: 'topic/:id/review', component: ReviewComponent },
  { path: '**', redirectTo: '' }
];
