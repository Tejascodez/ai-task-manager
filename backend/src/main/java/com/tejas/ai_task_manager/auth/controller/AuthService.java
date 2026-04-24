package com.tejas.ai_task_manager.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.tejas.ai_task_manager.user.User;
import com.tejas.ai_task_manager.user.UserRepository;
import com.tejas.ai_task_manager.auth.dto.LoginRequest;
import com.tejas.ai_task_manager.auth.dto.RegisterRequest;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ✅ REGISTER
    public String register(RegisterRequest request) {

        // check if user exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        // create user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // 🔥 always from backend

        userRepository.save(user);

        // generate token
        return jwtService.generateToken(user.getEmail(), user.getRole());
    }

    // ✅ LOGIN
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // generate token
        return jwtService.generateToken(user.getEmail(), user.getRole());
    }
}