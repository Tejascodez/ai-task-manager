package com.tejas.ai_task_manager.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api")  // 👈 add this
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Protected API is working!";
    }
}