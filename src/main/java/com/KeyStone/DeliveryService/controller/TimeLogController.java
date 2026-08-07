package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.TimeLogRequestDTO;
import com.KeyStone.DeliveryService.dto.TimeLogResponseDTO;
import com.KeyStone.DeliveryService.service.TimeLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TimeLogController {

    private final TimeLogService timeLogService;

    @PostMapping("/api/workorders/{id}/timer/start")
    @PreAuthorize("hasAnyAuthority('START_WORK', 'ADD_TIME_LOGS')")
    public ResponseEntity<ApiResponse<TimeLogResponseDTO>> startTimer(
            @PathVariable("id") Long workOrderId,
            @RequestBody(required = false) TimeLogRequestDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        TimeLogResponseDTO response = timeLogService.startTimer(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Timer Started Successfully", response));
    }

    @PutMapping("/api/workorders/{id}/timer/pause")
    @PreAuthorize("hasAnyAuthority('HOLD_WORK', 'ADD_TIME_LOGS')")
    public ResponseEntity<ApiResponse<TimeLogResponseDTO>> pauseTimer(
            @PathVariable("id") Long workOrderId,
            @RequestBody(required = false) TimeLogRequestDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        TimeLogResponseDTO response = timeLogService.pauseTimer(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Timer Paused Successfully", response));
    }

    @PutMapping("/api/workorders/{id}/timer/resume")
    @PreAuthorize("hasAnyAuthority('RESUME_WORK', 'ADD_TIME_LOGS')")
    public ResponseEntity<ApiResponse<TimeLogResponseDTO>> resumeTimer(
            @PathVariable("id") Long workOrderId,
            @RequestBody(required = false) TimeLogRequestDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        TimeLogResponseDTO response = timeLogService.resumeTimer(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Timer Resumed Successfully", response));
    }

    @PutMapping("/api/workorders/{id}/timer/stop")
    @PreAuthorize("hasAnyAuthority('COMPLETE_WORK', 'ADD_TIME_LOGS')")
    public ResponseEntity<ApiResponse<TimeLogResponseDTO>> stopTimer(
            @PathVariable("id") Long workOrderId,
            @RequestBody(required = false) TimeLogRequestDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        TimeLogResponseDTO response = timeLogService.stopTimer(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Timer Stopped Successfully", response));
    }

    @GetMapping("/api/workorders/{id}/timelogs")
    @PreAuthorize("hasAuthority('VIEW_TIME_LOGS')")
    public ResponseEntity<ApiResponse<List<TimeLogResponseDTO>>> getWorkOrderTimeLogs(@PathVariable("id") Long workOrderId) {
        List<TimeLogResponseDTO> timeLogs = timeLogService.getWorkOrderTimeLogs(workOrderId);
        return ResponseEntity.ok(ApiResponse.success("Work Order Time Logs Fetched Successfully", timeLogs));
    }

    @GetMapping("/api/technicians/{id}/timelogs")
    @PreAuthorize("hasAuthority('VIEW_TIME_LOGS')")
    public ResponseEntity<ApiResponse<List<TimeLogResponseDTO>>> getTechnicianTimeLogs(@PathVariable("id") Long technicianId) {
        List<TimeLogResponseDTO> timeLogs = timeLogService.getTechnicianTimeLogs(technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician Time Logs Fetched Successfully", timeLogs));
    }
}
