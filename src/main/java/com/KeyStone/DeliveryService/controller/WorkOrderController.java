package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.AssignTechnicianDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderRequestDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderResponseDTO;
import com.KeyStone.DeliveryService.dto.WorkOrderUpdateDTO;
import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;
import com.KeyStone.DeliveryService.service.WorkOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workorders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_WORK_ORDER', 'RAISE_REQUEST')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> createWorkOrder(
            @Valid @RequestBody WorkOrderRequestDTO request,
            Authentication authentication) {
        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO created = workOrderService.createWorkOrder(request, userEmail);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work Order Created Successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> getAllWorkOrders() {
        List<WorkOrderResponseDTO> workOrders = workOrderService.getAllWorkOrders();
        return ResponseEntity.ok(ApiResponse.success("Work Orders fetched successfully", workOrders));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'VIEW_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> getWorkOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO workOrder = workOrderService.getWorkOrder(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order details fetched successfully", workOrder));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('UPDATE_WORK_ORDER', 'EDIT_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderUpdateDTO request,
            Authentication authentication) {
        String userEmail = (authentication != null) ? authentication.getName() : null;
        WorkOrderResponseDTO updated = workOrderService.updateWorkOrder(id, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Work Order Updated Successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_WORK_ORDER')")
    public ResponseEntity<ApiResponse<Void>> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Work Order Deactivated Successfully", null));
    }

    @PutMapping("/activate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> activateWorkOrder(@PathVariable Long id) {
        WorkOrderResponseDTO activated = workOrderService.activateWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Work Order Activated Successfully", activated));
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAuthority('UPDATE_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> restoreWorkOrder(@PathVariable Long id) {
        WorkOrderResponseDTO restored = workOrderService.restoreWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Work Order Restored Successfully", restored));
    }

    @PutMapping("/assign")
    @PreAuthorize("hasAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> assignTechnician(@Valid @RequestBody AssignTechnicianDTO request) {
        WorkOrderResponseDTO assigned = workOrderService.assignTechnician(request);
        return ResponseEntity.ok(ApiResponse.success("Technician Assigned Successfully", assigned));
    }

    @PutMapping("/start/{id}")
    @PreAuthorize("hasAuthority('START_WORK')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> startWork(@PathVariable Long id) {
        WorkOrderResponseDTO started = workOrderService.startWork(id);
        return ResponseEntity.ok(ApiResponse.success("Work Started Successfully", started));
    }

    @PutMapping("/hold/{id}")
    @PreAuthorize("hasAuthority('HOLD_WORK')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> holdWork(@PathVariable Long id) {
        WorkOrderResponseDTO held = workOrderService.holdWork(id);
        return ResponseEntity.ok(ApiResponse.success("Work Put On Hold Successfully", held));
    }

    @PutMapping("/resume/{id}")
    @PreAuthorize("hasAuthority('RESUME_WORK')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> resumeWork(@PathVariable Long id) {
        WorkOrderResponseDTO resumed = workOrderService.resumeWork(id);
        return ResponseEntity.ok(ApiResponse.success("Work Resumed Successfully", resumed));
    }

    @PutMapping("/complete/{id}")
    @PreAuthorize("hasAuthority('COMPLETE_WORK')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> completeWork(@PathVariable Long id) {
        WorkOrderResponseDTO completed = workOrderService.completeWork(id);
        return ResponseEntity.ok(ApiResponse.success("Work Completed Successfully", completed));
    }

    @PutMapping("/cancel/{id}")
    @PreAuthorize("hasAuthority('CANCEL_WORK_ORDER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> cancelWorkOrder(@PathVariable Long id) {
        WorkOrderResponseDTO cancelled = workOrderService.cancelWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Work Order Cancelled Successfully", cancelled));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'VIEW_OWN_REQUEST')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> getCustomerWorkOrders(
            @PathVariable Long customerId,
            Authentication authentication) {
        String userEmail = (authentication != null) ? authentication.getName() : null;
        List<WorkOrderResponseDTO> workOrders = workOrderService.getCustomerWorkOrders(customerId, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Customer Work Orders fetched successfully", workOrders));
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> getTechnicianWorkOrders(@PathVariable Long technicianId) {
        List<WorkOrderResponseDTO> workOrders = workOrderService.getTechnicianWorkOrders(technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician Work Orders fetched successfully", workOrders));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> getWorkOrdersByStatus(@PathVariable WorkOrderStatus status) {
        List<WorkOrderResponseDTO> workOrders = workOrderService.getWorkOrdersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Work Orders by status fetched successfully", workOrders));
    }

    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> getWorkOrdersByPriority(@PathVariable Priority priority) {
        List<WorkOrderResponseDTO> workOrders = workOrderService.getWorkOrdersByPriority(priority);
        return ResponseEntity.ok(ApiResponse.success("Work Orders by priority fetched successfully", workOrders));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<WorkOrderResponseDTO>>> searchWorkOrders(@RequestParam String title) {
        List<WorkOrderResponseDTO> workOrders = workOrderService.searchWorkOrders(title);
        return ResponseEntity.ok(ApiResponse.success("Work Orders search results fetched successfully", workOrders));
    }
}
