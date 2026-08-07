package com.KeyStone.DeliveryService.controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.AssignTechnicianRequestDTO;
import com.KeyStone.DeliveryService.dto.AssignmentResponseDTO;
import com.KeyStone.DeliveryService.service.TechnicianAssignmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workorders")
@RequiredArgsConstructor
public class TechnicianAssignmentController {

    private final TechnicianAssignmentService assignmentService;

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<ApiResponse<AssignmentResponseDTO>> assignTechnician(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody AssignTechnicianRequestDTO request,
            Authentication authentication) {

        String dispatcherEmail = (authentication != null) ? authentication.getName() : null;
        AssignmentResponseDTO response = assignmentService.assignTechnician(workOrderId, request.getTechnicianId(), dispatcherEmail);
        return ResponseEntity.ok(ApiResponse.success("Technician Assigned Successfully", response));
    }

    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<ApiResponse<AssignmentResponseDTO>> reassignTechnician(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody AssignTechnicianRequestDTO request,
            Authentication authentication) {

        String dispatcherEmail = (authentication != null) ? authentication.getName() : null;
        AssignmentResponseDTO response = assignmentService.reassignTechnician(workOrderId, request.getTechnicianId(), dispatcherEmail);
        return ResponseEntity.ok(ApiResponse.success("Technician Reassigned Successfully", response));
    }

    @DeleteMapping("/{id}/assignment")
    @PreAuthorize("hasAuthority('ASSIGN_WORK_ORDER')")
    public ResponseEntity<ApiResponse<AssignmentResponseDTO>> removeAssignment(
            @PathVariable("id") Long workOrderId,
            Authentication authentication) {

        String dispatcherEmail = (authentication != null) ? authentication.getName() : null;
        AssignmentResponseDTO response = assignmentService.removeAssignment(workOrderId, dispatcherEmail);
        return ResponseEntity.ok(ApiResponse.success("Assignment Removed Successfully", response));
    }

    @GetMapping("/{id}/assignment")
    @PreAuthorize("hasAnyAuthority('VIEW_WORK_ORDER', 'ASSIGN_WORK_ORDER')")
    public ResponseEntity<ApiResponse<AssignmentResponseDTO>> getAssignment(@PathVariable("id") Long workOrderId) {
        AssignmentResponseDTO response = assignmentService.getAssignment(workOrderId);
        return ResponseEntity.ok(ApiResponse.success("Assignment Details Fetched Successfully", response));
    }
}
