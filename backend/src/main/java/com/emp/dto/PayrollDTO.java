package com.emp.dto;

import com.emp.model.PayrollStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PayrollDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String department;
    private int month;
    private int year;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal da;
    private BigDecimal ta;
    private BigDecimal grossSalary;
    private BigDecimal pf;
    private BigDecimal tax;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private int presentDays;
    private int absentDays;
    private int leaveDays;
    private PayrollStatus status;
    private LocalDate generatedDate;
    private LocalDate paidDate;
}
