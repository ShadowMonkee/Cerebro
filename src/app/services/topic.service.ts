import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, switchMap } from 'rxjs';
import { Topic, TopicIndex } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private cache = new Map<string, Topic>();
  private indexCache: string[] | null = null;
  private basePath = 'assets/topics';

  constructor(private http: HttpClient) {}

  /** Get the list of all topic IDs */
  getTopicIndex(): Observable<string[]> {
    if (this.indexCache) {
      return of(this.indexCache);
    }
    return this.http.get<TopicIndex>(`${this.basePath}/topics-index.json`).pipe(
      map(data => data.topics),
      tap(topics => this.indexCache = topics)
    );
  }

  /** Get a single topic by ID */
  getTopic(id: string): Observable<Topic> {
    const cached = this.cache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<Topic>(`${this.basePath}/${id}.json`).pipe(
      tap(topic => this.cache.set(id, topic))
    );
  }

  /** Get all topics (fetches index, then each topic) */
  getAllTopics(): Observable<Topic[]> {
    return this.getTopicIndex().pipe(
      switchMap(ids => {
        if (ids.length === 0) return of([]);

        // Check if all are cached
        const allCached = ids.every(id => this.cache.has(id));
        if (allCached) {
          return of(ids.map(id => this.cache.get(id)!));
        }

        // Fetch all topics in parallel using forkJoin-like behavior
        return new Observable<Topic[]>(subscriber => {
          const topics: Topic[] = [];
          let completed = 0;

          ids.forEach((id, index) => {
            this.getTopic(id).subscribe({
              next: topic => {
                topics[index] = topic;
                completed++;
                if (completed === ids.length) {
                  subscriber.next(topics);
                  subscriber.complete();
                }
              },
              error: err => subscriber.error(err)
            });
          });
        });
      })
    );
  }
}
