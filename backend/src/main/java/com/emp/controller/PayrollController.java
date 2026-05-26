package com.emp.controller;

import com.emp.dto.PayrollDTO;
import com.emp.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<PayrollDTO> generatePayroll(@RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(payrollService.generatePayroll(
                body.get("employeeId").longValue(), body.get("month"), body.get("year")));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<PayrollDTO>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollDTO>> getPayrollByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployee(employeeId));
    }

    @GetMapping("/month")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<PayrollDTO>> getPayrollByMonth(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getPayrollByMonthYear(month, year));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<PayrollDTO> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }
}
