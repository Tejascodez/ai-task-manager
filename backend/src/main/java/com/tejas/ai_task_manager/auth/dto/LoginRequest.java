package com.tejas.ai_task_manager.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}