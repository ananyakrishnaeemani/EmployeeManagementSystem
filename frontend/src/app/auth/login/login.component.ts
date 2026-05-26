import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <i class="fas fa-building"></i>
          <h1>EMS Portal</h1>
          <p>Employee Management System</p>
        </div>

        <div class="error-msg" *ngIf="error">{{ error }}</div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input class="form-control" type="text" [(ngModel)]="username" name="username"
                   placeholder="Enter username" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-control" type="password" [(ngModel)]="password" name="password"
                   placeholder="Enter password" required>
          </div>
          <button class="btn btn-primary w-full" type="submit" [disabled]="loading">
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            <i class="fas fa-sign-in-alt" *ngIf="!loading"></i>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p style="text-align:center; margin-top:20px; font-size:12px; color:#aaa;">
          Default: admin / admin123
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}
