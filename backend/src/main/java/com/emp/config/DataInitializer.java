package com.emp.config;

import com.emp.model.*;
import com.emp.repository.EmployeeRepository;
import com.emp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@company.com")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }

        // Create HR user
        if (!userRepository.existsByUsername("hr")) {
            User hr = User.builder()
                    .username("hr")
                    .password(passwordEncoder.encode("hr123"))
                    .email("hr@company.com")
                    .role(Role.ROLE_HR)
                    .enabled(true)
                    .build();
            userRepository.save(hr);
        }

        // Create sample employee user
        if (!userRepository.existsByUsername("john.doe")) {
            User empUser = User.builder()
                    .username("john.doe")
                    .password(passwordEncoder.encode("emp123"))
                    .email("john.doe@company.com")
                    .role(Role.ROLE_EMPLOYEE)
                    .enabled(true)
                    .build();
            empUser = userRepository.save(empUser);

            Employee emp = Employee.builder()
                    .firstName("John")
                    .lastName("Doe")
                    .employeeCode("EMP001")
                    .department("Engineering")
                    .designation("Software Engineer")
                    .phone("9876543210")
                    .dateOfJoining(LocalDate.of(2023, 1, 15))
                    .dateOfBirth(LocalDate.of(1995, 6, 20))
                    .basicSalary(new BigDecimal("50000"))
                    .status(EmployeeStatus.ACTIVE)
                    .user(empUser)
                    .build();
            employeeRepository.save(emp);
        }
    }
}
