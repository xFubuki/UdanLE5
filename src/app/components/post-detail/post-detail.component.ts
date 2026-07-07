import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TimeoutError, finalize, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Post } from '../../models/post.model';

type ApiErrorResponse = {
  message?: string;
};

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  post = signal<Post | undefined>(undefined);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage.set('Invalid post ID.');
        this.post.set(undefined);
        return;
      }

      this.loadPost(id);
    });
  }

  private loadPost(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http
      .get<Post>(`${this.apiBaseUrl}/Post/${id}`)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          this.post.set(data);
        },
        error: (error: HttpErrorResponse | TimeoutError) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.post.set(undefined);
        },
      });
  }

  private getErrorMessage(error: HttpErrorResponse | TimeoutError): string {
    if (error instanceof TimeoutError) {
      return 'The backend did not respond in time. Restart the API and try again.';
    }

    const apiError = error.error as ApiErrorResponse | null;

    if (apiError?.message) {
      return apiError.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the backend. Confirm the API is running and CORS allows http://localhost:4200.';
    }

    if (error.status === 404) {
      return 'Post not found.';
    }

    return 'Unable to load this post.';
  }
}
