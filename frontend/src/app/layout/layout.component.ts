import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2><i class="fas fa-building" style="margin-right:8px"></i>EMS Portal</h2>
          <p>Employee Management</p>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section-title">Main</div>
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </a>

          <div class="nav-section-title" *ngIf="isHR()">Management</div>
          <a class="nav-item" routerLink="/employees" routerLinkActive="active" *ngIf="isHR()">
            <i class="fas fa-users"></i> Employees
          </a>

          <div class="nav-section-title">HR</div>
          <a class="nav-item" routerLink="/leaves" routerLinkActive="active">
            <i class="fas fa-calendar-times"></i> Leave Management
          </a>
          <a class="nav-item" routerLink="/attendance" routerLinkActive="active">
            <i class="fas fa-clock"></i> Attendance
          </a>
          <a class="nav-item" routerLink="/payroll" routerLinkActive="active">
            <i class="fas fa-money-bill-wave"></i> Payroll
          </a>
        </nav>
      </aside>

      <!-- Main -->
      <div class="main-content">
        <header class="topbar">
          <span class="topbar-title">{{ pageTitle() }}</span>
          <div class="topbar-actions">
            <div class="user-badge">
              <div class="avatar">{{ userInitial() }}</div>
              <div>
                <div style="font-weight:600; font-size:14px">{{ username() }}</div>
                <div style="font-size:11px; color:#aaa">{{ role() }}</div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  constructor(private authService: AuthService) {}

  username = computed(() => this.authService.currentUser()?.username ?? '');
  role = computed(() => this.authService.currentUser()?.role?.replace('ROLE_', '') ?? '');
  userInitial = computed(() => this.username().charAt(0).toUpperCase());
  pageTitle = computed(() => 'Employee Management System');

  isHR() { return this.authService.isHR(); }
  logout() { this.authService.logout(); }
}
