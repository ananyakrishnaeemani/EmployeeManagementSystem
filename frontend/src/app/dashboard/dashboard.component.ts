import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { EmployeeService } from '../core/services/employee.service';
import { LeaveService } from '../core/services/leave.service';
import { AttendanceService } from '../core/services/attendance.service';
import { PayrollService } from '../core/services/payroll.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 style="font-size:22px; font-weight:700; color:#1a237e; margin-bottom:8px">
        Welcome back, {{ username }}!
      </h2>
      <p style="color:#888; margin-bottom:24px; font-size:14px">
        Here's what's happening today — {{ today | date:'fullDate' }}
      </p>

      <div class="stats-grid">
        <div class="stat-card" *ngIf="isHR">
          <div class="stat-icon blue"><i class="fas fa-users"></i></div>
          <div class="stat-info">
            <h3>{{ stats.totalEmployees }}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fas fa-calendar-times"></i></div>
          <div class="stat-info">
            <h3>{{ stats.pendingLeaves }}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
          <div class="stat-info">
            <h3>{{ stats.presentToday }}</h3>
            <p>Present Today</p>
          </div>
        </div>
        <div class="stat-card" *ngIf="isHR">
          <div class="stat-icon purple"><i class="fas fa-money-bill-wave"></i></div>
          <div class="stat-info">
            <h3>{{ stats.payrollGenerated }}</h3>
            <p>Payrolls Generated</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Quick Actions</span>
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap">
          <button class="btn btn-primary" (click)="navigate('/leaves')">
            <i class="fas fa-plus"></i> Apply Leave
          </button>
          <button class="btn btn-success" (click)="navigate('/attendance')">
            <i class="fas fa-clock"></i> Mark Attendance
          </button>
          <button class="btn btn-outline" (click)="navigate('/payroll')">
            <i class="fas fa-file-invoice-dollar"></i> View Payslip
          </button>
          <button class="btn btn-outline" *ngIf="isHR" (click)="navigate('/employees')">
            <i class="fas fa-user-plus"></i> Add Employee
          </button>
        </div>
      </div>

      <!-- Recent Leaves -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Leave Requests</span>
        </div>
        <div class="table-container">
          <div class="loading" *ngIf="loadingLeaves">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
          <table *ngIf="!loadingLeaves && recentLeaves.length > 0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of recentLeaves">
                <td>{{ leave.employeeName }}</td>
                <td>{{ leave.leaveType }}</td>
                <td>{{ leave.startDate | date:'mediumDate' }}</td>
                <td>{{ leave.endDate | date:'mediumDate' }}</td>
                <td>{{ leave.totalDays }}</td>
                <td>
                  <span class="badge" [ngClass]="getLeaveStatusClass(leave.status!)">
                    {{ leave.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!loadingLeaves && recentLeaves.length === 0">
            <i class="fas fa-calendar-check"></i>
            No leave requests found
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  today = new Date();
  username = '';
  isHR = false;
  loadingLeaves = true;
  recentLeaves: any[] = [];
  stats = { totalEmployees: 0, pendingLeaves: 0, presentToday: 0, payrollGenerated: 0 };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private attendanceService: AttendanceService,
    private payrollService: PayrollService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    this.username = user?.username ?? '';
    this.isHR = this.authService.isHR();
    this.loadData();
  }

  loadData() {
    if (this.isHR) {
      this.employeeService.getAll().subscribe(emps => this.stats.totalEmployees = emps.length);
      this.leaveService.getPending().subscribe(leaves => this.stats.pendingLeaves = leaves.length);
      this.payrollService.getAll().subscribe(p => this.stats.payrollGenerated = p.length);
      this.leaveService.getAll().subscribe(leaves => {
        this.recentLeaves = leaves.slice(0, 5);
        this.loadingLeaves = false;
      });
      const today = new Date().toISOString().split('T')[0];
      this.attendanceService.getByDate(today).subscribe(att => {
        this.stats.presentToday = att.filter(a => a.status === 'PRESENT').length;
      });
    } else {
      const empId = this.authService.currentUser()?.employeeId;
      if (empId) {
        this.leaveService.getByEmployee(empId).subscribe(leaves => {
          this.stats.pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;
          this.recentLeaves = leaves.slice(0, 5);
          this.loadingLeaves = false;
        });
      } else {
        this.loadingLeaves = false;
      }
    }
  }

  navigate(path: string) {
    window.location.href = path;
  }

  getLeaveStatusClass(status: string) {
    const map: Record<string, string> = {
      PENDING: 'badge-warning', APPROVED: 'badge-success',
      REJECTED: 'badge-danger', CANCELLED: 'badge-secondary'
    };
    return map[status] ?? 'badge-secondary';
  }
}
