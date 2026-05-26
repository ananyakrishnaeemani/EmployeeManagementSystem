package com.emp.service;

import com.emp.dto.EmployeeDTO;
import com.emp.model.Employee;
import com.emp.model.EmployeeStatus;
import com.emp.model.User;
import com.emp.repository.EmployeeRepository;
import com.emp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public EmployeeDTO getEmployeeById(Long id) {
        return toDTO(employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found")));
    }

    public EmployeeDTO getEmployeeByUserId(Long userId) {
        return toDTO(employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found")));
    }

    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        if (employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new RuntimeException("Employee code already exists");
        }
        Employee emp = fromDTO(dto);
        emp.setStatus(EmployeeStatus.ACTIVE);
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            emp.setUser(user);
        }
        return toDTO(employeeRepository.save(emp));
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        emp.setFirstName(dto.getFirstName());
        emp.setLastName(dto.getLastName());
        emp.setDepartment(dto.getDepartment());
        emp.setDesignation(dto.getDesignation());
        emp.setPhone(dto.getPhone());
        emp.setDateOfJoining(dto.getDateOfJoining());
        emp.setDateOfBirth(dto.getDateOfBirth());
        emp.setBasicSalary(dto.getBasicSalary());
        if (dto.getStatus() != null) emp.setStatus(dto.getStatus());
        return toDTO(employeeRepository.save(emp));
    }

    public void deleteEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        emp.setStatus(EmployeeStatus.INACTIVE);
        employeeRepository.save(emp);
    }

    private EmployeeDTO toDTO(Employee emp) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(emp.getId());
        dto.setFirstName(emp.getFirstName());
        dto.setLastName(emp.getLastName());
        dto.setEmployeeCode(emp.getEmployeeCode());
        dto.setDepartment(emp.getDepartment());
        dto.setDesignation(emp.getDesignation());
        dto.setPhone(emp.getPhone());
        dto.setDateOfJoining(emp.getDateOfJoining());
        dto.setDateOfBirth(emp.getDateOfBirth());
        dto.setBasicSalary(emp.getBasicSalary());
        dto.setStatus(emp.getStatus());
        if (emp.getUser() != null) {
            dto.setUserId(emp.getUser().getId());
            dto.setUsername(emp.getUser().getUsername());
            dto.setEmail(emp.getUser().getEmail());
        }
        return dto;
    }

    private Employee fromDTO(EmployeeDTO dto) {
        return Employee.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .employeeCode(dto.getEmployeeCode())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .phone(dto.getPhone())
                .dateOfJoining(dto.getDateOfJoining())
                .dateOfBirth(dto.getDateOfBirth())
                .basicSalary(dto.getBasicSalary())
                .build();
    }
}
