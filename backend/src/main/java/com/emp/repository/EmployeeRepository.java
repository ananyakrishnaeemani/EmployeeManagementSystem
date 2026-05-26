package com.emp.repository;

import com.emp.model.Employee;
import com.emp.model.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByUserId(Long userId);
    List<Employee> findByStatus(EmployeeStatus status);
    List<Employee> findByDepartment(String department);
    boolean existsByEmployeeCode(String employeeCode);
}
