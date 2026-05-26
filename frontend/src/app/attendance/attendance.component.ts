import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { AttendanceService } from '../core/services/attendance.service';
import { Attendance, AttendanceStatus } from '../core/models/attendance.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex-between mb-16">
        <h2 style="font-size:20px; font-weight:700; color:#1a237e">Attendance</h2>
        <div style="display:flex; gap:8px">
          <button class="btn btn-success" (click)="checkIn()" *ngIf="!isHR && !checkedIn">
            <i class="fas fa-sign-in-alt"></i> Check In
          </button>
          <button class="btn btn-danger" (click)="checkOut()" *ngIf="!isHR && checkedIn">
            <i class="fas fa-sign-out-alt"></i> Check Out
          </button>
          <button class="btn btn-primary" (click)="openMarkModal()" *ngIf="isHR">
            <i class="fas fa-plus"></i> Mark Attendance
          </button>
        </div>
      </div>

      <!-- Today's Status (Employee) -->
      <div class="card" *ngIf="!isHR && todayAttendance">
        <div class="card-header">
          <span class="card-title">Today's Status — {{ today | date:'fullDate' }}</span>
        </div>
        <div style="display:flex; gap:24px; flex-wrap:wrap">
          <div>
            <div style="font-size:12px; color:#888">Status</div>
            <span class="badge" [ngClass]="getStatusClass(todayAttendance.status)">
              {{ todayAttendance.status }}
            </span>
          </div>
          <div>
            <div style="font-size:12px; color:#888">Check In</div>
            <div style="font-weight:600">{{ todayAttendance.checkIn || '—' }}</div>
          </div>
          <div>
            <div style="font-size:12px; color:#888">Check Out</div>
            <div style="font-weight:600">{{ todayAttendance.checkOut || '—' }}</div>
          </div>
          <div>
            <div style="font-size:12px; color:#888">Working Hours</div>
            <div style="font-weight:600">{{ todayAttendance.workingHours?.toFixed(1) || '0' }} hrs</div>
          </div>
        </div>
      </div>

      <!-- Filter (HR) -->
      <div class="card" *ngIf="isHR">
        <div style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap">
          <div class="form-group" style="margin:0">
            <label class="form-label">Filter by Date</label>
            <input class="form-control" type="date" [(ngModel)]="filterDate" (change)="loadByDate()">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Attendance Records</span>
        </div>
        <div class="table-container">
          <div class="loading" *ngIf="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
          <table *ngIf="!loading && records.length > 0">
            <thead>
              <tr>
                <th *ngIf="isHR">Employee</th>
                <th>Date</th><th>Check In</th><th>Check Out</th>
                <th>Hours</th><th>Status</th><th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of records">
                <td *ngIf="isHR">
                  <strong>{{ rec.employeeName }}</strong><br>
                  <small style="color:#888">{{ rec.employeeCode }}</small>
                </td>
                <td>{{ rec.date | date:'mediumDate' }}</td>
                <td>{{ rec.checkIn || '—' }}</td>
                <td>{{ rec.checkOut || '—' }}</td>
                <td>{{ rec.workingHours?.toFixed(1) || '0' }} hrs</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(rec.status)">{{ rec.status }}</span>
                </td>
                <td>{{ rec.remarks || '—' }}</td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!loading && records.length === 0">
            <i class="fas fa-clock"></i>
            No attendance records found
          </div>
        </div>
      </div>
    </div>

    <!-- Mark Attendance Modal (HR) -->
    <div class="modal-overlay" *ngIf="showMarkModal" (click)="showMarkModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Mark Attendance</span>
          <button class="modal-close" (click)="showMarkModal=false">×</button>
        </div>
        <form (ngSubmit)="submitMark()">
          <div class="form-group">
            <label class="form-label">Employee ID *</label>
            <input class="form-control" type="number" [(ngModel)]="markForm.employeeId" name="employeeId" required>
          </div>
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input class="form-control" type="date" [(ngModel)]="markForm.date" name="date" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Check In</label>
              <input class="form-control" type="time" [(ngModel)]="markForm.checkIn" name="checkIn">
            </div>
            <div class="form-group">
              <label class="form-label">Check Out</label>
              <input class="form-control" type="time" [(ngModel)]="markForm.checkOut" name="checkOut">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Status *</label>
            <select class="form-control" [(ngModel)]="markForm.status" name="status" required>
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Remarks</label>
            <input class="form-control" [(ngModel)]="markForm.remarks" name="remarks">
          </div>
          <div class="flex-between mt-16">
            <button type="button" class="btn btn-outline" (click)="showMarkModal=false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  records: Attendance[] = [];
  loading = true;
  isHR = false;
  employeeId: number | null = null;
  today = new Date();
  todayAttendance: Attendance | null = null;
  checkedIn = false;
  filterDate = new Date().toISOString().split('T')[0];
  showMarkModal = false;
  markForm: Partial<Attendance> = {};
  statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'];

  constructor(private authService: AuthService, private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.isHR = this.authService.isHR();
    this.employeeId = this.authService.currentUser()?.employeeId ?? null;
    this.loadRecords();
  }

  loadRecords() {
    this.loading = true;
    if (this.isHR) {
      this.attendanceService.getByDate(this.filterDate).subscribe({
        next: recs => { this.records = recs; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.employeeId) {
      this.attendanceService.getByEmployee(this.employeeId).subscribe({
        next: recs => {
          this.records = recs;
          this.loading = false;
          const todayStr = new Date().toISOString().split('T')[0];
          this.todayAttendance = recs.find(r => r.date === todayStr) ?? null;
          this.checkedIn = !!this.todayAttendance?.checkIn && !this.todayAttendance?.checkOut;
        },
        error: () => this.loading = false
      });
    }
  }

  loadByDate() { this.loadRecords(); }

  checkIn() {
    if (!this.employeeId) return;
    this.attendanceService.checkIn(this.employeeId).subscribe({
      next: () => { this.checkedIn = true; this.loadRecords(); },
      error: (err) => alert(err.error?.message || 'Error checking in')
    });
  }

  checkOut() {
    if (!this.employeeId) return;
    this.attendanceService.checkOut(this.employeeId).subscribe({
      next: () => { this.checkedIn = false; this.loadRecords(); },
      error: (err) => alert(err.error?.message || 'Error checking out')
    });
  }

  openMarkModal() {
    this.markForm = { date: new Date().toISOString().split('T')[0], status: 'PRESENT' };
    this.showMarkModal = true;
  }

  submitMark() {
    this.attendanceService.mark(this.markForm as Attendance).subscribe({
      next: () => { this.showMarkModal = false; this.loadRecords(); },
      error: (err) => alert(err.error?.message || 'Error marking attendance')
    });
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      PRESENT: 'badge-success', ABSENT: 'badge-danger',
      HALF_DAY: 'badge-warning', ON_LEAVE: 'badge-info', HOLIDAY: 'badge-secondary'
    };
    return map[status] ?? 'badge-secondary';
  }
}
