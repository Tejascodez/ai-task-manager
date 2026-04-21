package com.tejas.ai_task_manager.task.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tejas.ai_task_manager.task.model.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(String email);
}