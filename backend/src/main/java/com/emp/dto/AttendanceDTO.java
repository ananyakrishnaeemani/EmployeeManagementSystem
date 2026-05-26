package com.emp.dto;

import com.emp.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private AttendanceStatus status;
    private double workingHours;
    private String remarks;
}
