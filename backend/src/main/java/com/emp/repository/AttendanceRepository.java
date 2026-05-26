package com.emp.repository;

import com.emp.model.Attendance;
import com.emp.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeId(Long employeeId);
    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end);
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<Attendance> findByDate(LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :empId AND a.status = :status AND MONTH(a.date) = :month AND YEAR(a.date) = :year")
    long countByEmployeeIdAndStatusAndMonthAndYear(Long empId, AttendanceStatus status, int month, int year);
}
