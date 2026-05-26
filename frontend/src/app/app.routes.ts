import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./employee/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_HR'] }
      },
      {
        path: 'leaves',
        loadComponent: () => import('./leave/leave-list/leave-list.component').then(m => m.LeaveListComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      {
        path: 'payroll',
        loadComponent: () => import('./payroll/payroll.component').then(m => m.PayrollComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
