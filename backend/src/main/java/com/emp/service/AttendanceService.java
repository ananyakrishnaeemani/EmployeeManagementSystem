package com.emp.service;

import com.emp.dto.AttendanceDTO;
import com.emp.model.Attendance;
import com.emp.model.AttendanceStatus;
import com.emp.model.Employee;
import com.emp.repository.AttendanceRepository;
import com.emp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        attendanceRepository.findByEmployeeIdAndDate(dto.getEmployeeId(), dto.getDate())
                .ifPresent(a -> { throw new RuntimeException("Attendance already marked for this date"); });

        double hours = 0;
        if (dto.getCheckIn() != null && dto.getCheckOut() != null) {
            hours = ChronoUnit.MINUTES.between(dto.getCheckIn(), dto.getCheckOut()) / 60.0;
        }

        Attendance attendance = Attendance.builder()
                .employee(emp)
                .date(dto.getDate())
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .status(dto.getStatus() != null ? dto.getStatus() : AttendanceStatus.PRESENT)
                .workingHours(hours)
                .remarks(dto.getRemarks())
                .build();

        return toDTO(attendanceRepository.save(attendance));
    }

    public AttendanceDTO checkIn(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate today = LocalDate.now();
        attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .ifPresent(a -> { throw new RuntimeException("Already checked in today"); });

        Attendance attendance = Attendance.builder()
                .employee(emp)
                .date(today)
                .checkIn(LocalTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        return toDTO(attendanceRepository.save(attendance));
    }

    public AttendanceDTO checkOut(Long employeeId) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        attendance.setCheckOut(LocalTime.now());
        double hours = ChronoUnit.MINUTES.between(attendance.getCheckIn(), attendance.getCheckOut()) / 60.0;
        attendance.setWorkingHours(hours);
        if (hours < 4) attendance.setStatus(AttendanceStatus.HALF_DAY);

        return toDTO(attendanceRepository.save(attendance));
    }

    public List<AttendanceDTO> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByEmployeeAndDateRange(Long employeeId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, start, end)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        attendance.setCheckIn(dto.getCheckIn());
        attendance.setCheckOut(dto.getCheckOut());
        attendance.setStatus(dto.getStatus());
        attendance.setRemarks(dto.getRemarks());
        if (dto.getCheckIn() != null && dto.getCheckOut() != null) {
            double hours = ChronoUnit.MINUTES.between(dto.getCheckIn(), dto.getCheckOut()) / 60.0;
            attendance.setWorkingHours(hours);
        }
        return toDTO(attendanceRepository.save(attendance));
    }

    private AttendanceDTO toDTO(Attendance a) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(a.getId());
        dto.setEmployeeId(a.getEmployee().getId());
        dto.setEmployeeName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName());
        dto.setEmployeeCode(a.getEmployee().getEmployeeCode());
        dto.setDate(a.getDate());
        dto.setCheckIn(a.getCheckIn());
        dto.setCheckOut(a.getCheckOut());
        dto.setStatus(a.getStatus());
        dto.setWorkingHours(a.getWorkingHours());
        dto.setRemarks(a.getRemarks());
        return dto;
    }
}
