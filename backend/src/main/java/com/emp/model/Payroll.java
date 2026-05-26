package com.emp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private int month;
    private int year;

    @Column(precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal hra;           // House Rent Allowance

    @Column(precision = 10, scale = 2)
    private BigDecimal da;            // Dearness Allowance

    @Column(precision = 10, scale = 2)
    private BigDecimal ta;            // Travel Allowance

    @Column(precision = 10, scale = 2)
    private BigDecimal grossSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal pf;            // Provident Fund deduction

    @Column(precision = 10, scale = 2)
    private BigDecimal tax;           // Income Tax deduction

    @Column(precision = 10, scale = 2)
    private BigDecimal otherDeductions;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalDeductions;

    @Column(precision = 10, scale = 2)
    private BigDecimal netSalary;

    private int presentDays;
    private int absentDays;
    private int leaveDays;

    @Enumerated(EnumType.STRING)
    private PayrollStatus status;

    private LocalDate generatedDate;
    private LocalDate paidDate;
}
