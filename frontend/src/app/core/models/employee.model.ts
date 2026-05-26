export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department: string;
  designation: string;
  phone: string;
  dateOfJoining: string;
  dateOfBirth: string;
  basicSalary: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  userId?: number;
  username?: string;
  email?: string;
}
