import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaveRequest } from '../models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly API = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  apply(leave: LeaveRequest) { return this.http.post<LeaveRequest>(`${this.API}/apply`, leave); }
  getAll() { return this.http.get<LeaveRequest[]>(this.API); }
  getByEmployee(empId: number) { return this.http.get<LeaveRequest[]>(`${this.API}/employee/${empId}`); }
  getPending() { return this.http.get<LeaveRequest[]>(`${this.API}/pending`); }
  approve(id: number, comment: string) { return this.http.put<LeaveRequest>(`${this.API}/${id}/approve`, { comment }); }
  reject(id: number, comment: string) { return this.http.put<LeaveRequest>(`${this.API}/${id}/reject`, { comment }); }
  cancel(id: number) { return this.http.put<LeaveRequest>(`${this.API}/${id}/cancel`, {}); }
}
