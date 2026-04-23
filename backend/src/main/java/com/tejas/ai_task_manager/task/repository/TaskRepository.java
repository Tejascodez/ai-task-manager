package com.tejas.ai_task_manager.task.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tejas.ai_task_manager.task.model.Task;
import com.tejas.ai_task_manager.task.model.Status;


import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(String email);
    Page<Task> findByAssignedTo(String email, Pageable pageable);
    Page<Task> findByAssignedToAndStatus(String email, Status status, Pageable pageable);
}