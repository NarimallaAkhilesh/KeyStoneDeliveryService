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
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.PartRequestDTO;
import com.KeyStone.DeliveryService.dto.PartResponseDTO;
import com.KeyStone.DeliveryService.dto.PartUsageRequestDTO;
import com.KeyStone.DeliveryService.dto.PartUsageResponseDTO;
import com.KeyStone.DeliveryService.dto.StockUpdateDTO;
import com.KeyStone.DeliveryService.service.PartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PartController {

    private final PartService partService;

    // --- Parts Catalog Endpoints ---

    @PostMapping("/api/parts")
    @PreAuthorize("hasAuthority('ADD_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> createPart(@Valid @RequestBody PartRequestDTO request) {
        PartResponseDTO created = partService.createPart(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Part Created Successfully", created));
    }

    @GetMapping("/api/parts")
    @PreAuthorize("hasAuthority('VIEW_PARTS')")
    public ResponseEntity<ApiResponse<List<PartResponseDTO>>> getAllParts() {
        List<PartResponseDTO> parts = partService.getAllParts();
        return ResponseEntity.ok(ApiResponse.success("Parts Catalog Fetched Successfully", parts));
    }

    @GetMapping("/api/parts/{id}")
    @PreAuthorize("hasAuthority('VIEW_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> getPartById(@PathVariable Long id) {
        PartResponseDTO part = partService.getPart(id);
        return ResponseEntity.ok(ApiResponse.success("Part Details Fetched Successfully", part));
    }

    @PutMapping("/api/parts/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> updatePart(
            @PathVariable Long id,
            @Valid @RequestBody PartRequestDTO request) {
        PartResponseDTO updated = partService.updatePart(id, request);
        return ResponseEntity.ok(ApiResponse.success("Part Updated Successfully", updated));
    }

    @DeleteMapping("/api/parts/{id}")
    @PreAuthorize("hasAuthority('DELETE_PARTS')")
    public ResponseEntity<ApiResponse<Void>> deletePart(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part Deactivated Successfully", null));
    }

    @PutMapping("/api/parts/activate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> activatePart(@PathVariable Long id) {
        PartResponseDTO activated = partService.activatePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part Activated Successfully", activated));
    }

    @PutMapping("/api/parts/deactivate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> deactivatePart(@PathVariable Long id) {
        PartResponseDTO deactivated = partService.deactivatePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part Deactivated Successfully", deactivated));
    }

    @PutMapping("/api/parts/restore/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> restorePart(@PathVariable Long id) {
        PartResponseDTO restored = partService.restorePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part Restored Successfully", restored));
    }

    @GetMapping("/api/parts/low-stock")
    @PreAuthorize("hasAuthority('VIEW_PARTS')")
    public ResponseEntity<ApiResponse<List<PartResponseDTO>>> getLowStockParts() {
        List<PartResponseDTO> lowStock = partService.getLowStockParts();
        return ResponseEntity.ok(ApiResponse.success("Low Stock Parts Fetched Successfully", lowStock));
    }

    @PutMapping("/api/parts/{id}/stock")
    @PreAuthorize("hasAuthority('UPDATE_PARTS')")
    public ResponseEntity<ApiResponse<PartResponseDTO>> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateDTO request) {
        PartResponseDTO updated = partService.updateStock(id, request);
        return ResponseEntity.ok(ApiResponse.success("Part Stock Updated Successfully", updated));
    }

    // --- Work Order Parts Usage Endpoints ---

    @PostMapping("/api/workorders/{id}/parts")
    @PreAuthorize("hasAnyAuthority('USE_PARTS', 'ADD_PARTS')")
    public ResponseEntity<ApiResponse<PartUsageResponseDTO>> addPartToWorkOrder(
            @PathVariable("id") Long workOrderId,
            @Valid @RequestBody PartUsageRequestDTO request,
            Authentication authentication) {

        String userEmail = (authentication != null) ? authentication.getName() : null;
        PartUsageResponseDTO usage = partService.addPartToWorkOrder(workOrderId, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Part Added to Work Order Successfully", usage));
    }

    @GetMapping("/api/workorders/{id}/parts")
    @PreAuthorize("hasAuthority('VIEW_PARTS')")
    public ResponseEntity<ApiResponse<List<PartUsageResponseDTO>>> getWorkOrderParts(@PathVariable("id") Long workOrderId) {
        List<PartUsageResponseDTO> parts = partService.getWorkOrderParts(workOrderId);
        return ResponseEntity.ok(ApiResponse.success("Work Order Parts Fetched Successfully", parts));
    }

    @DeleteMapping("/api/workorders/{id}/parts/{usageId}")
    @PreAuthorize("hasAnyAuthority('DELETE_PARTS', 'USE_PARTS')")
    public ResponseEntity<ApiResponse<Void>> removePartFromWorkOrder(
            @PathVariable("id") Long workOrderId,
            @PathVariable("usageId") Long usageId) {

        partService.removePartFromWorkOrder(workOrderId, usageId);
        return ResponseEntity.ok(ApiResponse.success("Part Usage Removed and Stock Restored", null));
    }
}
