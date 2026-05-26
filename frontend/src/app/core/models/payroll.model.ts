export type PayrollStatus = 'GENERATED' | 'PAID' | 'CANCELLED';

export interface Payroll {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  month: number;
  year: number;
  basicSalary: number;
  hra: number;
  da: number;
  ta: number;
  grossSalary: number;
  pf: number;
  tax: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  status: PayrollStatus;
  generatedDate?: string;
  paidDate?: string;
}
