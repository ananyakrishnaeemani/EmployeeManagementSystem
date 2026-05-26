export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays?: number;
  reason: string;
  status?: LeaveStatus;
  approverComment?: string;
  approvedBy?: string;
  appliedAt?: string;
}
