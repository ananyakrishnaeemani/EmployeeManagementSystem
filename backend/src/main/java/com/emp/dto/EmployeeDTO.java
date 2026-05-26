package com.emp.dto;

import com.emp.model.EmployeeStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String employeeCode;
    private String department;
    private String designation;
    private String phone;
    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;
    private BigDecimal basicSalary;
    private EmployeeStatus status;
    private Long userId;
    private String username;
    private String email;
}
