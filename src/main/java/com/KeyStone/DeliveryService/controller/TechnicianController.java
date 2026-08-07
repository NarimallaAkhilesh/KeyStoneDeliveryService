package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.TechnicianDashboardDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.service.TechnicianAssignmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianAssignmentService assignmentService;

    @GetMapping("/{id}/workorders")
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> getTechnicianWorkOrders(
            @PathVariable("id") Long technicianId,
            @RequestParam(required = false) String filter) {

        List<WorkOrderResponseDTO> workOrders = assignmentService.getTechnicianWorkOrders(technicianId, filter);
        return ResponseEntity.ok(ApiResponse.success("Technician work orders fetched successfully", workOrders));
    }

    @GetMapping("/{id}/dashboard")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'VIEW_DASHBOARD')")
    public ResponseEntity<ApiResponse<TechnicianDashboardDTO>> getTechnicianDashboard(@PathVariable("id") Long technicianId) {
        TechnicianDashboardDTO dashboard = assignmentService.getTechnicianDashboard(technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician dashboard details fetched successfully", dashboard));
    }
}
