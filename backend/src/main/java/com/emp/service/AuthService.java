package com.emp.service;

import com.emp.config.JwtUtil;
import com.emp.dto.AuthRequest;
import com.emp.dto.AuthResponse;
import com.emp.dto.RegisterRequest;
import com.emp.model.Employee;
import com.emp.model.Role;
import com.emp.model.User;
import com.emp.repository.EmployeeRepository;
import com.emp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        Long employeeId = null;
        Optional<Employee> emp = employeeRepository.findByUserId(user.getId());
        if (emp.isPresent()) employeeId = emp.get().getId();

        return new AuthResponse(token, user.getUsername(), user.getRole().name(), employeeId);
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE)
                .enabled(true)
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }
}
