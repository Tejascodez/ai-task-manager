package com.tejas.ai_task_manager.task.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.tejas.ai_task_manager.task.model.Status;
import com.tejas.ai_task_manager.task.model.Task;
import com.tejas.ai_task_manager.task.repository.TaskRepository;
import com.tejas.ai_task_manager.ai.GeminiService;
import com.tejas.ai_task_manager.user.User;
import com.tejas.ai_task_manager.user.Role;
import com.tejas.ai_task_manager.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final GeminiService geminiService;
    private final UserRepository userRepository;

    // 🔥 CREATE TASK (AI POWERED)
    public Task createTask(Task task) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        task.setAssignedTo(email);
        task.setStatus(Status.TODO);

        if (task.getDescription() == null || task.getDescription().isEmpty()) {
            try {
                String aiDescription = geminiService.generateDescription(task.getTitle());
                task.setDescription(aiDescription);
            } catch (Exception e) {
                task.setDescription("Auto-generated description unavailable");
            }
        }

        try {
            String priority = geminiService.generatePriority(task.getDescription());
            task.setPriority(priority);
        } catch (Exception e) {
            task.setPriority("MEDIUM");
        }

        return taskRepository.save(task);
    }

    // ✅ GET MY TASKS
    public Page<Task> getMyTasks(int page, int size, Status status) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("id").descending());

        if (status != null) {
            return taskRepository.findByAssignedToAndStatus(email, status, pageable);
        }
        return taskRepository.findByAssignedTo(email, pageable);
    }

    // ✅ UPDATE STATUS (ONLY ASSIGNED USER)
    public Task updateStatus(Long taskId, Status status) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String currentUser = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        if (!task.getAssignedTo().equals(currentUser)) {
            throw new RuntimeException("You are not allowed to update this task");
        }

        task.setStatus(status);

        return taskRepository.save(task);
    }

    // ✅ ASSIGN TASK (ADMIN / MANAGER ONLY)
    public Task assignTask(Long taskId, String assignToEmail) {

        String currentEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Only ADMIN or MANAGER can assign tasks");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User assignedUser = userRepository.findByEmail(assignToEmail)
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        task.setAssignedTo(assignedUser.getEmail());

        return taskRepository.save(task);
    }

    // ✅ DELETE TASK (ADMIN / MANAGER / OWNER)
    public Task deleteTask(Long taskId) {

        String currentEmail = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isAdminOrManager = user.getRole() == Role.ADMIN || user.getRole() == Role.MANAGER;

        boolean isOwner = task.getAssignedTo() != null &&
                task.getAssignedTo().equals(currentEmail);

        if (!isAdminOrManager && !isOwner) {
            throw new RuntimeException("You are not allowed to delete this task");
        }

        taskRepository.delete(task);

        return task;
    }
}