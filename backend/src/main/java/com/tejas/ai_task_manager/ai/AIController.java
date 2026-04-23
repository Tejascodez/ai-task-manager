package com.tejas.ai_task_manager.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final GeminiService geminiService;

    @GetMapping("/generate-description")
    public String generate(@RequestParam String title) {
        return geminiService.generateDescription(title);
    }
}