import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Attendance } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly API = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  mark(att: Attendance) { return this.http.post<Attendance>(`${this.API}/mark`, att); }
  checkIn(empId: number) { return this.http.post<Attendance>(`${this.API}/checkin/${empId}`, {}); }
  checkOut(empId: number) { return this.http.post<Attendance>(`${this.API}/checkout/${empId}`, {}); }
  getByEmployee(empId: number) { return this.http.get<Attendance[]>(`${this.API}/employee/${empId}`); }
  getByDate(date: string) { return this.http.get<Attendance[]>(`${this.API}/date/${date}`); }
  update(id: number, att: Attendance) { return this.http.put<Attendance>(`${this.API}/${id}`, att); }
}
