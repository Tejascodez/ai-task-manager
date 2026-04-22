package com.tejas.ai_task_manager.auth.dto;

import com.tejas.ai_task_manager.user.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}