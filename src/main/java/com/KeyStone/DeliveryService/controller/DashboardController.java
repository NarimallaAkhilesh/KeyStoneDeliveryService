package com.KeyStone.DeliveryService.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.DashboardSummaryDTO;
import com.KeyStone.DeliveryService.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD', 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboard() {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard Analytics Fetched Successfully", summary));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD', 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardSummary() {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard Summary Fetched Successfully", summary));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD', 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardStatistics() {
        DashboardSummaryDTO stats = dashboardService.getDashboardStatistics();
        return ResponseEntity.ok(ApiResponse.success("Dashboard Statistics Fetched Successfully", stats));
    }
}
