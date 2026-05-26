package com.emp.service;

import com.emp.dto.LeaveRequestDTO;
import com.emp.model.*;
import com.emp.repository.EmployeeRepository;
import com.emp.repository.LeaveRequestRepository;
import com.emp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public LeaveRequestDTO applyLeave(LeaveRequestDTO dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        int days = (int) ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        LeaveRequest leave = LeaveRequest.builder()
                .employee(emp)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .totalDays(days)
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toDTO(leaveRepository.save(leave));
    }

    public List<LeaveRequestDTO> getAllLeaves() {
        return leaveRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getPendingLeaves() {
        return leaveRepository.findByStatus(LeaveStatus.PENDING).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public LeaveRequestDTO updateLeaveStatus(Long leaveId, LeaveStatus status, String comment, String approverUsername) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        leave.setStatus(status);
        leave.setApproverComment(comment);
        leave.setUpdatedAt(LocalDateTime.now());

        if (approverUsername != null) {
            userRepository.findByUsername(approverUsername).ifPresent(leave::setApprovedBy);
        }

        return toDTO(leaveRepository.save(leave));
    }

    public LeaveRequestDTO cancelLeave(Long leaveId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leaves can be cancelled");
        }
        leave.setStatus(LeaveStatus.CANCELLED);
        leave.setUpdatedAt(LocalDateTime.now());
        return toDTO(leaveRepository.save(leave));
    }

    private LeaveRequestDTO toDTO(LeaveRequest leave) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(leave.getId());
        dto.setEmployeeId(leave.getEmployee().getId());
        dto.setEmployeeName(leave.getEmployee().getFirstName() + " " + leave.getEmployee().getLastName());
        dto.setEmployeeCode(leave.getEmployee().getEmployeeCode());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setTotalDays(leave.getTotalDays());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus());
        dto.setApproverComment(leave.getApproverComment());
        dto.setAppliedAt(leave.getAppliedAt());
        if (leave.getApprovedBy() != null) {
            dto.setApprovedBy(leave.getApprovedBy().getUsername());
        }
        return dto;
    }
}
