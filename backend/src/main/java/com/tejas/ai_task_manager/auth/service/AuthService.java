package com.tejas.ai_task_manager.auth.service;

import com.tejas.ai_task_manager.auth.JwtService;
import com.tejas.ai_task_manager.auth.dto.LoginRequest;
import com.tejas.ai_task_manager.auth.dto.RegisterRequest;
import com.tejas.ai_task_manager.user.Role;
import com.tejas.ai_task_manager.user.User;
import com.tejas.ai_task_manager.user.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // ✅ always USER — never trust client

        userRepository.save(user);

        return jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );
    }
}