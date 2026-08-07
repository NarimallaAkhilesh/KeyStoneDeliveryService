package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.StatusHistoryDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderCancelDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderCompleteDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderDashboardDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderHoldDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderStatusUpdateDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderTimelineDTO;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.service.WorkOrderTrackingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workorders")
@RequiredArgsConstructor
public class WorkOrderTrackingController {

    private final WorkOrderTrackingService trackingService;

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('UPDATE_WORK_ORDER', 'START_WORK', 'HOLD_WORK', 'RESUME_WORK', 'COMPLETE_WORK')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> updateStatus(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody WorkOrderStatusUpdateDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO updated = trackingService.updateStatus(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Status Updated Successfully", updated));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('COMPLETE_WORK', 'UPDATE_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> completeWorkOrder(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody WorkOrderCompleteDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO completed = trackingService.completeWorkOrder(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Completed Successfully", completed));
    }

    @PutMapping("/{id}/hold")
    @PreAuthorize("hasAnyAuthority('HOLD_WORK', 'UPDATE_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> holdWorkOrder(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody WorkOrderHoldDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO held = trackingService.holdWorkOrder(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Placed On Hold Successfully", held));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('CANCEL_WORK_ORDER', 'UPDATE_WORK_ORDER', 'CANCEL_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> cancelWorkOrder(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody WorkOrderCancelDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO cancelled = trackingService.cancelWorkOrder(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Cancelled Successfully", cancelled));
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'VIEW_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<WorkOrderTimelineDTO>> getWorkOrderTimeline(
            @PathVariable("id") Long workOrderId,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderTimelineDTO timeline = trackingService.getWorkOrderTimeline(workOrderId, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Timeline Fetched Successfully", timeline));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'VIEW_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<List<StatusHistoryDTO>>> getWorkOrderHistory(
            @PathVariable("id") Long workOrderId,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        List<StatusHistoryDTO> history = trackingService.getWorkOrderHistory(workOrderId, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Status History Fetched Successfully", history));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('VIEW_DASHBOARD', 'VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderDashboardDTO>> getDashboardStatistics() {
        WorkOrderDashboardDTO dashboard = trackingService.getDashboardStatistics();
        return ResponseEntity.ok(ApiResponse.success("Dashboard Statistics Fetched Successfully", dashboard));
    }

    @GetMapping("/search/advanced")
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> searchWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<WorkOrderResponseDTO> results = trackingService.searchWorkOrdersAdvanced(
                status, priority, customerId, siteId, technicianId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Work Orders Search Results Fetched Successfully", results));
    }
}
