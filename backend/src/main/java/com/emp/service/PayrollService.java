package com.emp.service;

import com.emp.dto.PayrollDTO;
import com.emp.model.*;
import com.emp.repository.AttendanceRepository;
import com.emp.repository.EmployeeRepository;
import com.emp.repository.LeaveRequestRepository;
import com.emp.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRepository;

    public PayrollDTO generatePayroll(Long employeeId, int month, int year) {
        if (payrollRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year).isPresent()) {
            throw new RuntimeException("Payroll already generated for this month");
        }

        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        int totalDays = YearMonth.of(year, month).lengthOfMonth();
        long presentDays = attendanceRepository.countByEmployeeIdAndStatusAndMonthAndYear(
                employeeId, AttendanceStatus.PRESENT, month, year);
        long halfDays = attendanceRepository.countByEmployeeIdAndStatusAndMonthAndYear(
                employeeId, AttendanceStatus.HALF_DAY, month, year);
        long leaveDays = leaveRepository.countByEmployeeIdAndStatus(employeeId, LeaveStatus.APPROVED);

        long effectiveDays = presentDays + (halfDays / 2) + leaveDays;
        long absentDays = totalDays - effectiveDays;

        BigDecimal basic = emp.getBasicSalary();
        BigDecimal perDaySalary = basic.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP);
        BigDecimal earnedBasic = perDaySalary.multiply(BigDecimal.valueOf(effectiveDays));

        // Allowances
        BigDecimal hra = earnedBasic.multiply(BigDecimal.valueOf(0.40)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal da = earnedBasic.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ta = BigDecimal.valueOf(1500).setScale(2, RoundingMode.HALF_UP);
        BigDecimal gross = earnedBasic.add(hra).add(da).add(ta);

        // Deductions
        BigDecimal pf = earnedBasic.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = gross.compareTo(BigDecimal.valueOf(50000)) > 0
                ? gross.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal totalDeductions = pf.add(tax);
        BigDecimal netSalary = gross.subtract(totalDeductions);

        Payroll payroll = Payroll.builder()
                .employee(emp)
                .month(month)
                .year(year)
                .basicSalary(earnedBasic)
                .hra(hra)
                .da(da)
                .ta(ta)
                .grossSalary(gross)
                .pf(pf)
                .tax(tax)
                .otherDeductions(BigDecimal.ZERO)
                .totalDeductions(totalDeductions)
                .netSalary(netSalary)
                .presentDays((int) presentDays)
                .absentDays((int) absentDays)
                .leaveDays((int) leaveDays)
                .status(PayrollStatus.GENERATED)
                .generatedDate(LocalDate.now())
                .build();

        return toDTO(payrollRepository.save(payroll));
    }

    public List<PayrollDTO> getAllPayrolls() {
        return payrollRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PayrollDTO> getPayrollByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PayrollDTO> getPayrollByMonthYear(int month, int year) {
        return payrollRepository.findByMonthAndYear(month, year).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PayrollDTO markAsPaid(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaidDate(LocalDate.now());
        return toDTO(payrollRepository.save(payroll));
    }

    private PayrollDTO toDTO(Payroll p) {
        PayrollDTO dto = new PayrollDTO();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployee().getId());
        dto.setEmployeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName());
        dto.setEmployeeCode(p.getEmployee().getEmployeeCode());
        dto.setDepartment(p.getEmployee().getDepartment());
        dto.setMonth(p.getMonth());
        dto.setYear(p.getYear());
        dto.setBasicSalary(p.getBasicSalary());
        dto.setHra(p.getHra());
        dto.setDa(p.getDa());
        dto.setTa(p.getTa());
        dto.setGrossSalary(p.getGrossSalary());
        dto.setPf(p.getPf());
        dto.setTax(p.getTax());
        dto.setOtherDeductions(p.getOtherDeductions());
        dto.setTotalDeductions(p.getTotalDeductions());
        dto.setNetSalary(p.getNetSalary());
        dto.setPresentDays(p.getPresentDays());
        dto.setAbsentDays(p.getAbsentDays());
        dto.setLeaveDays(p.getLeaveDays());
        dto.setStatus(p.getStatus());
        dto.setGeneratedDate(p.getGeneratedDate());
        dto.setPaidDate(p.getPaidDate());
        return dto;
    }
}
