import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveRequest, LeaveType } from '../../core/models/leave.model';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex-between mb-16">
        <h2 style="font-size:20px; font-weight:700; color:#1a237e">Leave Management</h2>
        <button class="btn btn-primary" (click)="openApplyModal()">
          <i class="fas fa-plus"></i> Apply Leave
        </button>
      </div>

      <!-- Tabs -->
      <div style="display:flex; gap:4px; margin-bottom:20px; background:white; padding:6px; border-radius:10px; width:fit-content; box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <button class="btn btn-sm" [class.btn-primary]="activeTab==='all'" [class.btn-outline]="activeTab!=='all'"
                (click)="setTab('all')">All Leaves</button>
        <button class="btn btn-sm" [class.btn-primary]="activeTab==='pending'" [class.btn-outline]="activeTab!=='pending'"
                (click)="setTab('pending')" *ngIf="isHR">Pending Approval</button>
      </div>

      <div class="card">
        <div class="table-container">
          <div class="loading" *ngIf="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
          <table *ngIf="!loading && leaves.length > 0">
            <thead>
              <tr>
                <th *ngIf="isHR">Employee</th>
                <th>Type</th><th>From</th><th>To</th>
                <th>Days</th><th>Reason</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of leaves">
                <td *ngIf="isHR">
                  <strong>{{ leave.employeeName }}</strong><br>
                  <small style="color:#888">{{ leave.employeeCode }}</small>
                </td>
                <td><span class="badge badge-info">{{ leave.leaveType }}</span></td>
                <td>{{ leave.startDate | date:'mediumDate' }}</td>
                <td>{{ leave.endDate | date:'mediumDate' }}</td>
                <td>{{ leave.totalDays }}</td>
                <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                  {{ leave.reason }}
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(leave.status!)">{{ leave.status }}</span>
                </td>
                <td>
                  <ng-container *ngIf="isHR && leave.status === 'PENDING'">
                    <button class="btn btn-sm btn-success" style="margin-right:4px"
                            (click)="openActionModal(leave, 'approve')">
                      <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="openActionModal(leave, 'reject')">
                      <i class="fas fa-times"></i>
                    </button>
                  </ng-container>
                  <button class="btn btn-sm btn-outline" *ngIf="leave.status === 'PENDING' && !isHR"
                          (click)="cancelLeave(leave.id!)">
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!loading && leaves.length === 0">
            <i class="fas fa-calendar-check"></i>
            No leave requests found
          </div>
        </div>
      </div>
    </div>

    <!-- Apply Leave Modal -->
    <div class="modal-overlay" *ngIf="showApplyModal" (click)="showApplyModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Apply for Leave</span>
          <button class="modal-close" (click)="showApplyModal=false">×</button>
        </div>
        <form (ngSubmit)="submitLeave()">
          <div class="form-group">
            <label class="form-label">Leave Type *</label>
            <select class="form-control" [(ngModel)]="applyForm.leaveType" name="leaveType" required>
              <option value="">Select Type</option>
              <option *ngFor="let t of leaveTypes" [value]="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">From Date *</label>
              <input class="form-control" type="date" [(ngModel)]="applyForm.startDate" name="startDate" required>
            </div>
            <div class="form-group">
              <label class="form-label">To Date *</label>
              <input class="form-control" type="date" [(ngModel)]="applyForm.endDate" name="endDate" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason *</label>
            <textarea class="form-control" [(ngModel)]="applyForm.reason" name="reason"
                      rows="3" required placeholder="Reason for leave..."></textarea>
          </div>
          <div class="flex-between mt-16">
            <button type="button" class="btn btn-outline" (click)="showApplyModal=false">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Approve/Reject Modal -->
    <div class="modal-overlay" *ngIf="showActionModal" (click)="showActionModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">{{ actionType === 'approve' ? 'Approve' : 'Reject' }} Leave</span>
          <button class="modal-close" (click)="showActionModal=false">×</button>
        </div>
        <div class="form-group">
          <label class="form-label">Comment</label>
          <textarea class="form-control" [(ngModel)]="actionComment" rows="3"
                    placeholder="Optional comment..."></textarea>
        </div>
        <div class="flex-between mt-16">
          <button class="btn btn-outline" (click)="showActionModal=false">Cancel</button>
          <button class="btn" [class.btn-success]="actionType==='approve'" [class.btn-danger]="actionType==='reject'"
                  (click)="submitAction()">
            {{ actionType === 'approve' ? 'Approve' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class LeaveListComponent implements OnInit {
  leaves: LeaveRequest[] = [];
  loading = true;
  saving = false;
  isHR = false;
  activeTab = 'all';
  employeeId: number | null = null;

  showApplyModal = false;
  showActionModal = false;
  actionType: 'approve' | 'reject' = 'approve';
  actionComment = '';
  selectedLeave: LeaveRequest | null = null;

  leaveTypes: LeaveType[] = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID'];
  applyForm: Partial<LeaveRequest> = {};

  constructor(private authService: AuthService, private leaveService: LeaveService) {}

  ngOnInit() {
    this.isHR = this.authService.isHR();
    this.employeeId = this.authService.currentUser()?.employeeId ?? null;
    this.loadLeaves();
  }

  setTab(tab: string) { this.activeTab = tab; this.loadLeaves(); }

  loadLeaves() {
    this.loading = true;
    const obs = this.activeTab === 'pending' && this.isHR
      ? this.leaveService.getPending()
      : this.isHR
        ? this.leaveService.getAll()
        : this.leaveService.getByEmployee(this.employeeId!);

    obs.subscribe({
      next: leaves => { this.leaves = leaves; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openApplyModal() {
    this.applyForm = {};
    this.showApplyModal = true;
  }

  submitLeave() {
    if (!this.employeeId) { alert('Employee profile not found'); return; }
    this.saving = true;
    this.leaveService.apply({ ...this.applyForm, employeeId: this.employeeId } as LeaveRequest).subscribe({
      next: () => { this.showApplyModal = false; this.saving = false; this.loadLeaves(); },
      error: (err) => { alert(err.error?.message || 'Error applying leave'); this.saving = false; }
    });
  }

  openActionModal(leave: LeaveRequest, type: 'approve' | 'reject') {
    this.selectedLeave = leave;
    this.actionType = type;
    this.actionComment = '';
    this.showActionModal = true;
  }

  submitAction() {
    if (!this.selectedLeave) return;
    const obs = this.actionType === 'approve'
      ? this.leaveService.approve(this.selectedLeave.id!, this.actionComment)
      : this.leaveService.reject(this.selectedLeave.id!, this.actionComment);
    obs.subscribe(() => { this.showActionModal = false; this.loadLeaves(); });
  }

  cancelLeave(id: number) {
    if (confirm('Cancel this leave request?')) {
      this.leaveService.cancel(id).subscribe(() => this.loadLeaves());
    }
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      PENDING: 'badge-warning', APPROVED: 'badge-success',
      REJECTED: 'badge-danger', CANCELLED: 'badge-secondary'
    };
    return map[status] ?? 'badge-secondary';
  }
}
