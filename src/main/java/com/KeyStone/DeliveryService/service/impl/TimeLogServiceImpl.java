package com.KeyStone.DeliveryService.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.TimeLogRequestDTO;
import com.KeyStone.DeliveryService.dto.TimeLogResponseDTO;
import com.KeyStone.DeliveryService.entity.TimeLog;
import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.exception.InvalidTimerException;
import com.KeyStone.DeliveryService.exception.WorkOrderNotFoundException;
import com.KeyStone.DeliveryService.repository.TimeLogRepository;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;
import com.KeyStone.DeliveryService.repository.WorkOrderRepository;
import com.KeyStone.DeliveryService.service.TimeLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TimeLogServiceImpl implements TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserAuthRepository userAuthRepository;

    @Override
    public TimeLogResponseDTO startTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId));

        UserAuth technician = getUserByEmail(userEmail);

        // Business rule: Prevent overlapping active timers across all work orders
        timeLogRepository.findByTechnicianIdAndStatus(technician.getId(), "RUNNING").ifPresent(t -> {
            throw new InvalidTimerException("Technician already has an active timer running on Work Order: " +
                    t.getWorkOrder().getWorkOrderNumber());
        });

        TimeLog timeLog = TimeLog.builder()
                .workOrder(workOrder)
                .technician(technician)
                .startTime(LocalDateTime.now())
                .status("RUNNING")
                .totalMinutes(0L)
                .workDescription(request != null ? request.getWorkDescription() : null)
                .remarks(request != null ? request.getRemarks() : null)
                .build();

        TimeLog saved = timeLogRepository.save(timeLog);
        return mapToDTO(saved);
    }

    @Override
    public TimeLogResponseDTO pauseTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail) {
        UserAuth technician = getUserByEmail(userEmail);

        TimeLog timeLog = timeLogRepository.findByWorkOrderIdAndTechnicianIdAndStatusIn(
                workOrderId, technician.getId(), Arrays.asList("RUNNING"))
                .orElseThrow(() -> new InvalidTimerException("No running timer found for Work Order ID: " + workOrderId));

        LocalDateTime now = LocalDateTime.now();
        long elapsedMinutes = Duration.between(timeLog.getStartTime(), now).toMinutes();

        timeLog.setTotalMinutes(timeLog.getTotalMinutes() + Math.max(1, elapsedMinutes));
        timeLog.setStatus("PAUSED");

        if (request != null) {
            if (request.getWorkDescription() != null) timeLog.setWorkDescription(request.getWorkDescription());
            if (request.getRemarks() != null) timeLog.setRemarks(request.getRemarks());
        }

        TimeLog saved = timeLogRepository.save(timeLog);
        return mapToDTO(saved);
    }

    @Override
    public TimeLogResponseDTO resumeTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail) {
        UserAuth technician = getUserByEmail(userEmail);

        // Prevent resuming if another timer is running elsewhere
        timeLogRepository.findByTechnicianIdAndStatus(technician.getId(), "RUNNING").ifPresent(t -> {
            throw new InvalidTimerException("Cannot resume. Technician already has an active timer running on Work Order: " +
                    t.getWorkOrder().getWorkOrderNumber());
        });

        TimeLog timeLog = timeLogRepository.findByWorkOrderIdAndTechnicianIdAndStatusIn(
                workOrderId, technician.getId(), Arrays.asList("PAUSED"))
                .orElseThrow(() -> new InvalidTimerException("No paused timer found for Work Order ID: " + workOrderId));

        timeLog.setStartTime(LocalDateTime.now());
        timeLog.setStatus("RUNNING");

        if (request != null) {
            if (request.getWorkDescription() != null) timeLog.setWorkDescription(request.getWorkDescription());
            if (request.getRemarks() != null) timeLog.setRemarks(request.getRemarks());
        }

        TimeLog saved = timeLogRepository.save(timeLog);
        return mapToDTO(saved);
    }

    @Override
    public TimeLogResponseDTO stopTimer(Long workOrderId, TimeLogRequestDTO request, String userEmail) {
        UserAuth technician = getUserByEmail(userEmail);

        TimeLog timeLog = timeLogRepository.findByWorkOrderIdAndTechnicianIdAndStatusIn(
                workOrderId, technician.getId(), Arrays.asList("RUNNING", "PAUSED"))
                .orElseThrow(() -> new InvalidTimerException("No active or paused timer found for Work Order ID: " + workOrderId));

        LocalDateTime now = LocalDateTime.now();

        if ("RUNNING".equalsIgnoreCase(timeLog.getStatus())) {
            long elapsedMinutes = Duration.between(timeLog.getStartTime(), now).toMinutes();
            timeLog.setTotalMinutes(timeLog.getTotalMinutes() + Math.max(1, elapsedMinutes));
        }

        timeLog.setEndTime(now);
        timeLog.setStatus("STOPPED");

        if (request != null) {
            if (request.getWorkDescription() != null) timeLog.setWorkDescription(request.getWorkDescription());
            if (request.getRemarks() != null) timeLog.setRemarks(request.getRemarks());
        }

        TimeLog saved = timeLogRepository.save(timeLog);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getWorkOrderTimeLogs(Long workOrderId) {
        if (!workOrderRepository.existsById(workOrderId)) {
            throw new WorkOrderNotFoundException("Work Order not found with id: " + workOrderId);
        }

        return timeLogRepository.findByWorkOrderId(workOrderId).stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getTechnicianTimeLogs(Long technicianId) {
        if (!userAuthRepository.existsById(technicianId)) {
            throw new RuntimeException("Technician not found with id: " + technicianId);
        }

        return timeLogRepository.findByTechnicianId(technicianId).stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private UserAuth getUserByEmail(String email) {
        if (email != null && !email.trim().isEmpty()) {
            return userAuthRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        }
        throw new RuntimeException("User authentication required");
    }

    private TimeLogResponseDTO mapToDTO(TimeLog timeLog) {
        TimeLogResponseDTO.TimeLogResponseDTOBuilder builder = TimeLogResponseDTO.builder()
                .id(timeLog.getId())
                .startTime(timeLog.getStartTime())
                .endTime(timeLog.getEndTime())
                .totalMinutes(timeLog.getTotalMinutes())
                .status(timeLog.getStatus())
                .workDescription(timeLog.getWorkDescription())
                .remarks(timeLog.getRemarks())
                .createdAt(timeLog.getCreatedAt());

        if (timeLog.getWorkOrder() != null) {
            builder.workOrderId(timeLog.getWorkOrder().getId())
                   .workOrderNumber(timeLog.getWorkOrder().getWorkOrderNumber());
        }

        if (timeLog.getTechnician() != null) {
            builder.technicianId(timeLog.getTechnician().getId())
                   .technicianName(timeLog.getTechnician().getUserName());
        }

        return builder.build();
    }
}
