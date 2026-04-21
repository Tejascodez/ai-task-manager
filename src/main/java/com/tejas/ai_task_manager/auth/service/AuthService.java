package com.tejas.ai_task_manager.auth.service;

import com.tejas.ai_task_manager.auth.JwtService;
import com.tejas.ai_task_manager.auth.dto.LoginRequest;
import com.tejas.ai_task_manager.auth.dto.RegisterRequest;
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

    // ✅ REGISTER
    public String register(RegisterRequest request) {

        // 🔥 check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        // 🔥 create user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole()); // ADMIN / USER

        userRepository.save(user);

        // 🔥 generate JWT with role
        return jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );
    }

    // ✅ LOGIN
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔥 verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 🔥 generate JWT with role
        return jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );
    }
}