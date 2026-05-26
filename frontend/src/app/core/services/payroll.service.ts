import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payroll } from '../models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly API = 'http://localhost:8080/api/payroll';

  constructor(private http: HttpClient) {}

  generate(employeeId: number, month: number, year: number) {
    return this.http.post<Payroll>(`${this.API}/generate`, { employeeId, month, year });
  }
  getAll() { return this.http.get<Payroll[]>(this.API); }
  getByEmployee(empId: number) { return this.http.get<Payroll[]>(`${this.API}/employee/${empId}`); }
  getByMonth(month: number, year: number) {
    return this.http.get<Payroll[]>(`${this.API}/month?month=${month}&year=${year}`);
  }
  markAsPaid(id: number) { return this.http.put<Payroll>(`${this.API}/${id}/pay`, {}); }
}
