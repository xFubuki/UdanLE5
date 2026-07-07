import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeoutError, finalize, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Post } from '../../models/post.model';

type ApiErrorResponse = {
  message?: string;
};

@Component({
  selector: 'app-list-posts',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-posts.component.html',
  styleUrl: './list-posts.component.css',
})
export class ListPostsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  posts = signal<Post[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http
      .get<Post[]>(`${this.apiBaseUrl}/Post`)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          this.posts.set(Array.isArray(data) ? data : []);
        },
        error: (error: HttpErrorResponse | TimeoutError) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.posts.set([]);
          console.error('Unable to load posts.', error);
        },
      });
  }

  private getErrorMessage(error: HttpErrorResponse | TimeoutError): string {
    if (error instanceof TimeoutError) {
      return 'The backend did not respond in time. Restart the API and refresh the page.';
    }

    const apiError = error.error as ApiErrorResponse | null;

    if (apiError?.message) {
      return apiError.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the backend. Confirm the API is running and CORS allows http://localhost:4200.';
    }

    return 'Unable to load posts. Please try again later.';
  }
}
