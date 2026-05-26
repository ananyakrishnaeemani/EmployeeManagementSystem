package com.emp.controller;

import com.emp.dto.LeaveRequestDTO;
import com.emp.model.LeaveStatus;
import com.emp.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDTO> applyLeave(@RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(leaveService.applyLeave(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDTO>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveRequestDTO> approveLeave(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body,
                                                         Authentication auth) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(
                id, LeaveStatus.APPROVED, body.get("comment"), auth.getName()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<LeaveRequestDTO> rejectLeave(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body,
                                                        Authentication auth) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(
                id, LeaveStatus.REJECTED, body.get("comment"), auth.getName()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LeaveRequestDTO> cancelLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.cancelLeave(id));
    }
}
