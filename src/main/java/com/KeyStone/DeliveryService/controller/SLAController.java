package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.SLAConfigurationDTO;
import com.KeyStone.DeliveryService.dto.SLADashboardDTO;
import com.KeyStone.DeliveryService.dto.SLAHistoryDTO;
import com.KeyStone.DeliveryService.service.SLAService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sla")
@RequiredArgsConstructor
public class SLAController {

    private final SLAService slaService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_DASHBOARD', 'VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<SLAConfigurationDTO>>> getAllConfigurations() {
        List<SLAConfigurationDTO> configs = slaService.getAllConfigurations();
        return ResponseEntity.ok(ApiResponse.success("SLA Configurations Fetched Successfully", configs));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public ResponseEntity<ApiResponse<SLAConfigurationDTO>> createConfiguration(@Valid @RequestBody SLAConfigurationDTO request) {
        SLAConfigurationDTO created = slaService.createConfiguration(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("SLA Configuration Created Successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<ApiResponse<SLAConfigurationDTO>> updateConfiguration(
            @PathVariable Long id,
            @Valid @RequestBody SLAConfigurationDTO request) {
        SLAConfigurationDTO updated = slaService.updateConfiguration(id, request);
        return ResponseEntity.ok(ApiResponse.success("SLA Configuration Updated Successfully", updated));
    }

    @GetMapping("/workorders/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'VIEW_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<SLAHistoryDTO>> getSLAForWorkOrder(@PathVariable("id") Long workOrderId) {
        SLAHistoryDTO history = slaService.getSLAForWorkOrder(workOrderId);
        return ResponseEntity.ok(ApiResponse.success("Work Order SLA Details Fetched Successfully", history));
    }

    @GetMapping("/breaches")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_DASHBOARD', 'VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<SLAHistoryDTO>>> getBreachedSLAs() {
        List<SLAHistoryDTO> breaches = slaService.getBreachedSLAs();
        return ResponseEntity.ok(ApiResponse.success("Breached SLAs Fetched Successfully", breaches));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyAuthority('VIEW_REPORTS', 'VIEW_DASHBOARD', 'VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<SLAHistoryDTO>>> getUpcomingDeadlines() {
        List<SLAHistoryDTO> upcoming = slaService.getUpcomingDeadlines();
        return ResponseEntity.ok(ApiResponse.success("Upcoming SLA Deadlines Fetched Successfully", upcoming));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD', 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<SLADashboardDTO>> getSLADashboard() {
        SLADashboardDTO dashboard = slaService.getSLADashboard();
        return ResponseEntity.ok(ApiResponse.success("SLA Dashboard Metrics Fetched Successfully", dashboard));
    }
}
