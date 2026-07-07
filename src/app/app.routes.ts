import { Routes } from '@angular/router';

import { ListPostsComponent } from './components/list-posts/list-posts.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';

export const routes: Routes = [
  { path: '', component: ListPostsComponent },
  { path: 'posts/:id', component: PostDetailComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: '**', redirectTo: '' },
];
