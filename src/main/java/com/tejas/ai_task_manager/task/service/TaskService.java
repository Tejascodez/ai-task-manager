package com.tejas.ai_task_manager.task.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.tejas.ai_task_manager.task.model.Status;
import com.tejas.ai_task_manager.task.model.Task;
import com.tejas.ai_task_manager.task.repository.TaskRepository;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public Task createTask(Task task) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        task.setAssignedTo(email); // assign to current user
        task.setStatus(Status.TODO);

        return taskRepository.save(task);
    }

    public List<Task> getMyTasks() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return taskRepository.findByAssignedTo(email);
    }

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
    public Task assignTask(Long taskId, String email) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setAssignedTo(email);

        return taskRepository.save(task);
    }
}