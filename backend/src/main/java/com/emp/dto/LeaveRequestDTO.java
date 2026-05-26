package com.emp.dto;

import com.emp.model.LeaveStatus;
import com.emp.model.LeaveType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private String reason;
    private LeaveStatus status;
    private String approverComment;
    private String approvedBy;
    private LocalDateTime appliedAt;
}
