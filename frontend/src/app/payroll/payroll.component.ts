import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { PayrollService } from '../core/services/payroll.service';
import { EmployeeService } from '../core/services/employee.service';
import { Payroll } from '../core/models/payroll.model';
import { Employee } from '../core/models/employee.model';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex-between mb-16">
        <h2 style="font-size:20px; font-weight:700; color:#1a237e">Payroll Management</h2>
        <button class="btn btn-primary" (click)="openGenerateModal()" *ngIf="isHR">
          <i class="fas fa-cog"></i> Generate Payroll
        </button>
      </div>

      <!-- Filter -->
      <div class="card" *ngIf="isHR">
        <div style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap">
          <div class="form-group" style="margin:0">
            <label class="form-label">Month</label>
            <select class="form-control" [(ngModel)]="filterMonth" (change)="loadPayrolls()">
              <option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</option>
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Year</label>
            <input class="form-control" type="number" [(ngModel)]="filterYear" (change)="loadPayrolls()" style="width:100px">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Payroll Records</span>
        </div>
        <div class="table-container">
          <div class="loading" *ngIf="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
          <table *ngIf="!loading && payrolls.length > 0">
            <thead>
              <tr>
                <th *ngIf="isHR">Employee</th>
                <th>Period</th><th>Basic</th><th>Gross</th>
                <th>Deductions</th><th>Net Salary</th>
                <th>Days</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payrolls">
                <td *ngIf="isHR">
                  <strong>{{ p.employeeName }}</strong><br>
                  <small style="color:#888">{{ p.employeeCode }} | {{ p.department }}</small>
                </td>
                <td>{{ months[p.month - 1] }} {{ p.year }}</td>
                <td>₹{{ p.basicSalary | number:'1.0-0' }}</td>
                <td>₹{{ p.grossSalary | number:'1.0-0' }}</td>
                <td style="color:#c62828">-₹{{ p.totalDeductions | number:'1.0-0' }}</td>
                <td><strong style="color:#2e7d32">₹{{ p.netSalary | number:'1.0-0' }}</strong></td>
                <td>
                  <span style="color:#2e7d32">{{ p.presentDays }}P</span> /
                  <span style="color:#c62828">{{ p.absentDays }}A</span> /
                  <span style="color:#1565c0">{{ p.leaveDays }}L</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="p.status === 'PAID' ? 'badge-success' : 'badge-warning'">
                    {{ p.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline" (click)="viewSlip(p)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-success" style="margin-left:4px"
                          *ngIf="isHR && p.status === 'GENERATED'" (click)="markPaid(p.id!)">
                    Pay
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!loading && payrolls.length === 0">
            <i class="fas fa-file-invoice-dollar"></i>
            No payroll records found
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <div class="modal-overlay" *ngIf="showGenerateModal" (click)="showGenerateModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Generate Payroll</span>
          <button class="modal-close" (click)="showGenerateModal=false">×</button>
        </div>
        <form (ngSubmit)="generatePayroll()">
          <div class="form-group">
            <label class="form-label">Employee *</label>
            <select class="form-control" [(ngModel)]="genForm.employeeId" name="employeeId" required>
              <option value="">Select Employee</option>
              <option *ngFor="let e of employees" [value]="e.id">
                {{ e.firstName }} {{ e.lastName }} ({{ e.employeeCode }})
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Month *</label>
              <select class="form-control" [(ngModel)]="genForm.month" name="month" required>
                <option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year *</label>
              <input class="form-control" type="number" [(ngModel)]="genForm.year" name="year" required>
            </div>
          </div>
          <div class="flex-between mt-16">
            <button type="button" class="btn btn-outline" (click)="showGenerateModal=false">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="generating">
              {{ generating ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Payslip Modal -->
    <div class="modal-overlay" *ngIf="showSlipModal" (click)="showSlipModal=false">
      <div class="modal" style="max-width:640px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Pay Slip — {{ months[(selectedPayroll?.month ?? 1) - 1] }} {{ selectedPayroll?.year }}</span>
          <button class="modal-close" (click)="showSlipModal=false">×</button>
        </div>
        <div *ngIf="selectedPayroll" style="font-size:14px">
          <div style="display:flex; justify-content:space-between; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #eee">
            <div>
              <div style="font-weight:700; font-size:16px">{{ selectedPayroll.employeeName }}</div>
              <div style="color:#888">{{ selectedPayroll.employeeCode }} | {{ selectedPayroll.department }}</div>
            </div>
            <span class="badge" [ngClass]="selectedPayroll.status === 'PAID' ? 'badge-success' : 'badge-warning'">
              {{ selectedPayroll.status }}
            </span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
            <div>
              <div style="font-weight:600; color:#1a237e; margin-bottom:8px">Earnings</div>
              <div class="slip-row"><span>Basic Salary</span><span>₹{{ selectedPayroll.basicSalary | number:'1.2-2' }}</span></div>
              <div class="slip-row"><span>HRA (40%)</span><span>₹{{ selectedPayroll.hra | number:'1.2-2' }}</span></div>
              <div class="slip-row"><span>DA (10%)</span><span>₹{{ selectedPayroll.da | number:'1.2-2' }}</span></div>
              <div class="slip-row"><span>Travel Allowance</span><span>₹{{ selectedPayroll.ta | number:'1.2-2' }}</span></div>
              <div class="slip-row" style="font-weight:700; border-top:1px solid #eee; padding-top:8px; margin-top:8px">
                <span>Gross Salary</span><span>₹{{ selectedPayroll.grossSalary | number:'1.2-2' }}</span>
              </div>
            </div>
            <div>
              <div style="font-weight:600; color:#c62828; margin-bottom:8px">Deductions</div>
              <div class="slip-row"><span>PF (12%)</span><span>₹{{ selectedPayroll.pf | number:'1.2-2' }}</span></div>
              <div class="slip-row"><span>Income Tax</span><span>₹{{ selectedPayroll.tax | number:'1.2-2' }}</span></div>
              <div class="slip-row"><span>Other</span><span>₹{{ selectedPayroll.otherDeductions | number:'1.2-2' }}</span></div>
              <div class="slip-row" style="font-weight:700; border-top:1px solid #eee; padding-top:8px; margin-top:8px">
                <span>Total Deductions</span><span>₹{{ selectedPayroll.totalDeductions | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div style="background:#e8f5e9; border-radius:8px; padding:16px; margin-top:16px; display:flex; justify-content:space-between; align-items:center">
            <span style="font-weight:600; font-size:16px">Net Salary</span>
            <span style="font-weight:700; font-size:22px; color:#2e7d32">₹{{ selectedPayroll.netSalary | number:'1.2-2' }}</span>
          </div>

          <div style="display:flex; gap:24px; margin-top:16px; font-size:13px; color:#666">
            <span><i class="fas fa-check-circle" style="color:#2e7d32"></i> Present: {{ selectedPayroll.presentDays }} days</span>
            <span><i class="fas fa-times-circle" style="color:#c62828"></i> Absent: {{ selectedPayroll.absentDays }} days</span>
            <span><i class="fas fa-calendar" style="color:#1565c0"></i> Leave: {{ selectedPayroll.leaveDays }} days</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slip-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f5f5f5;
      font-size: 13px;
    }
  `]
})
export class PayrollComponent implements OnInit {
  payrolls: Payroll[] = [];
  employees: Employee[] = [];
  loading = true;
  isHR = false;
  employeeId: number | null = null;
  filterMonth = new Date().getMonth() + 1;
  filterYear = new Date().getFullYear();
  showGenerateModal = false;
  showSlipModal = false;
  generating = false;
  selectedPayroll: Payroll | null = null;
  genForm: { employeeId?: number; month: number; year: number } = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  months = ['January','February','March','April','May','June',
            'July','August','September','October','November','December'];

  constructor(
    private authService: AuthService,
    private payrollService: PayrollService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.isHR = this.authService.isHR();
    this.employeeId = this.authService.currentUser()?.employeeId ?? null;
    this.loadPayrolls();
    if (this.isHR) {
      this.employeeService.getAll().subscribe(emps => this.employees = emps);
    }
  }

  loadPayrolls() {
    this.loading = true;
    const obs = this.isHR
      ? this.payrollService.getByMonth(this.filterMonth, this.filterYear)
      : this.payrollService.getByEmployee(this.employeeId!);

    obs.subscribe({
      next: p => { this.payrolls = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openGenerateModal() {
    this.genForm = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.showGenerateModal = true;
  }

  generatePayroll() {
    if (!this.genForm.employeeId) return;
    this.generating = true;
    this.payrollService.generate(this.genForm.employeeId, this.genForm.month, this.genForm.year).subscribe({
      next: () => { this.showGenerateModal = false; this.generating = false; this.loadPayrolls(); },
      error: (err) => { alert(err.error?.message || 'Error generating payroll'); this.generating = false; }
    });
  }

  markPaid(id: number) {
    if (confirm('Mark this payroll as paid?')) {
      this.payrollService.markAsPaid(id).subscribe(() => this.loadPayrolls());
    }
  }

  viewSlip(p: Payroll) {
    this.selectedPayroll = p;
    this.showSlipModal = true;
  }
}
