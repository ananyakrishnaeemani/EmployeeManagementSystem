import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex-between mb-16">
        <h2 style="font-size:20px; font-weight:700; color:#1a237e">Employees</h2>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fas fa-plus"></i> Add Employee
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Employee Directory</span>
          <input class="form-control" style="width:240px" type="text"
                 placeholder="Search employees..." [(ngModel)]="search">
        </div>
        <div class="table-container">
          <div class="loading" *ngIf="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Code</th><th>Name</th><th>Department</th>
                <th>Designation</th><th>Joining Date</th>
                <th>Salary</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of filteredEmployees">
                <td><strong>{{ emp.employeeCode }}</strong></td>
                <td>{{ emp.firstName }} {{ emp.lastName }}</td>
                <td>{{ emp.department }}</td>
                <td>{{ emp.designation }}</td>
                <td>{{ emp.dateOfJoining | date:'mediumDate' }}</td>
                <td>₹{{ emp.basicSalary | number:'1.0-0' }}</td>
                <td>
                  <span class="badge" [ngClass]="emp.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                    {{ emp.status }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon" (click)="editEmployee(emp)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon" style="margin-left:4px; color:#c62828"
                          (click)="deleteEmployee(emp.id!)" title="Deactivate">
                    <i class="fas fa-user-slash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!loading && filteredEmployees.length === 0">
            <i class="fas fa-users"></i>
            No employees found
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">{{ editMode ? 'Edit Employee' : 'Add Employee' }}</span>
          <button class="modal-close" (click)="closeModal()">×</button>
        </div>
        <form (ngSubmit)="saveEmployee()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name *</label>
              <input class="form-control" [(ngModel)]="form.firstName" name="firstName" required>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name *</label>
              <input class="form-control" [(ngModel)]="form.lastName" name="lastName" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Employee Code *</label>
              <input class="form-control" [(ngModel)]="form.employeeCode" name="employeeCode"
                     required [disabled]="editMode">
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input class="form-control" [(ngModel)]="form.phone" name="phone">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Department *</label>
              <select class="form-control" [(ngModel)]="form.department" name="department" required>
                <option value="">Select Department</option>
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Designation *</label>
              <input class="form-control" [(ngModel)]="form.designation" name="designation" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date of Joining</label>
              <input class="form-control" type="date" [(ngModel)]="form.dateOfJoining" name="dateOfJoining">
            </div>
            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input class="form-control" type="date" [(ngModel)]="form.dateOfBirth" name="dateOfBirth">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Basic Salary (₹) *</label>
            <input class="form-control" type="number" [(ngModel)]="form.basicSalary" name="basicSalary" required>
          </div>
          <div class="flex-between mt-16">
            <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
              {{ saving ? 'Saving...' : (editMode ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  showModal = false;
  editMode = false;
  saving = false;
  search = '';
  selectedId: number | null = null;

  departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'IT'];

  form: Partial<Employee> = {};

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() { this.loadEmployees(); }

  get filteredEmployees() {
    if (!this.search) return this.employees;
    const s = this.search.toLowerCase();
    return this.employees.filter(e =>
      e.firstName.toLowerCase().includes(s) ||
      e.lastName.toLowerCase().includes(s) ||
      e.employeeCode.toLowerCase().includes(s) ||
      e.department?.toLowerCase().includes(s)
    );
  }

  loadEmployees() {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: emps => { this.employees = emps; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal() {
    this.editMode = false;
    this.form = { status: 'ACTIVE' };
    this.showModal = true;
  }

  editEmployee(emp: Employee) {
    this.editMode = true;
    this.selectedId = emp.id!;
    this.form = { ...emp };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.form = {}; }

  saveEmployee() {
    this.saving = true;
    const obs = this.editMode
      ? this.employeeService.update(this.selectedId!, this.form as Employee)
      : this.employeeService.create(this.form as Employee);

    obs.subscribe({
      next: () => { this.loadEmployees(); this.closeModal(); this.saving = false; },
      error: (err) => { alert(err.error?.message || 'Error saving employee'); this.saving = false; }
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Deactivate this employee?')) {
      this.employeeService.delete(id).subscribe(() => this.loadEmployees());
    }
  }
}
