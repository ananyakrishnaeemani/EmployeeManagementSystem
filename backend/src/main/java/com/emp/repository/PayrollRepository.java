package com.emp.repository;

import com.emp.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeId(Long employeeId);
    List<Payroll> findByMonthAndYear(int month, int year);
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);
}
