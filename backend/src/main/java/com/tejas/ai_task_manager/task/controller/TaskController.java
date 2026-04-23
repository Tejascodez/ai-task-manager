package com.tejas.ai_task_manager.task.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.tejas.ai_task_manager.task.model.Status;
import com.tejas.ai_task_manager.task.model.Task;
import com.tejas.ai_task_manager.task.service.TaskService;

import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // ✅ CREATE TASK
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    // ✅ GET MY TASKS (Pagination + Sorting ready)
    @GetMapping("/my-tasks")
    public Page<Task> getMyTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) Status status){
        return taskService.getMyTasks(page, size, status);
    }

    // ✅ UPDATE STATUS (Only owner)
    @PutMapping("/{id}/status")
    public Task updateStatus(
            @PathVariable Long id,
            @RequestParam Status status) {

        return taskService.updateStatus(id, status);
    }

    // ✅ ASSIGN TASK (ADMIN / MANAGER only)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}/assign")
    public Task assignTask(
            @PathVariable Long id,
            @RequestParam String email) {

        return taskService.assignTask(id, email);
    }

    // ✅ DELETE TASK (ADMIN / MANAGER / OWNER)
    @DeleteMapping("/{id}")
    public Task deleteTask(@PathVariable Long id) {
        return taskService.deleteTask(id);
    }
}