package com.emp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String employeeCode;

    private String department;
    private String designation;
    private String phone;
    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;

    @Column(precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
