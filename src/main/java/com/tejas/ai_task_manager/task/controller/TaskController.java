package com.tejas.ai_task_manager.task.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.tejas.ai_task_manager.task.model.Status;
import com.tejas.ai_task_manager.task.model.Task;
import com.tejas.ai_task_manager.task.service.TaskService;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @GetMapping
    public List<Task> getMyTasks() {
        return taskService.getMyTasks();
    }

    @PutMapping("/{id}/status")
    public Task updateStatus(@PathVariable Long id,
            @RequestParam Status status) {
        return taskService.updateStatus(id, status);
    }

   @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}/assign")
    public Task assignTask(@PathVariable Long id,
            @RequestParam String email) {
        return taskService.assignTask(id, email);
    }
}