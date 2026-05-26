import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly API = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Employee[]>(this.API); }
  getById(id: number) { return this.http.get<Employee>(`${this.API}/${id}`); }
  getByUserId(userId: number) { return this.http.get<Employee>(`${this.API}/user/${userId}`); }
  create(emp: Employee) { return this.http.post<Employee>(this.API, emp); }
  update(id: number, emp: Employee) { return this.http.put<Employee>(`${this.API}/${id}`, emp); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }
}
