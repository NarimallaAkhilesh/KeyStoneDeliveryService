package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.KeyStone.DeliveryService.dto.SiteRequestDTO;
import com.KeyStone.DeliveryService.dto.SiteResponseDTO;
import com.KeyStone.DeliveryService.dto.SiteUpdateDTO;
import com.KeyStone.DeliveryService.service.SiteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_SITE')")
    public ResponseEntity<ApiResponse<SiteResponseDTO>> createSite(@Valid @RequestBody SiteRequestDTO request) {
        SiteResponseDTO created = siteService.createSite(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Site Created Successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_SITE')")
    public ResponseEntity<ApiResponse<List<SiteResponseDTO>>> getAllSites(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        List<SiteResponseDTO> sites = siteService.getAllSites(status);
        return ResponseEntity.ok(ApiResponse.success("Sites fetched successfully", sites));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SITE')")
    public ResponseEntity<ApiResponse<SiteResponseDTO>> getSiteById(@PathVariable Long id) {
        SiteResponseDTO site = siteService.getSite(id);
        return ResponseEntity.ok(ApiResponse.success("Site details fetched successfully", site));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_SITE')")
    public ResponseEntity<ApiResponse<SiteResponseDTO>> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody SiteUpdateDTO request) {
        SiteResponseDTO updated = siteService.updateSite(id, request);
        return ResponseEntity.ok(ApiResponse.success("Site Updated Successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_SITE')")
    public ResponseEntity<ApiResponse<Void>> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.ok(ApiResponse.success("Site Deactivated Successfully", null));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('VIEW_SITE', 'VIEW_OWN_REQUEST', 'RAISE_REQUEST')")
    public ResponseEntity<ApiResponse<List<SiteResponseDTO>>> getSitesByCustomer(@PathVariable Long customerId) {
        List<SiteResponseDTO> sites = siteService.getSitesByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer sites fetched successfully", sites));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_SITE')")
    public ResponseEntity<ApiResponse<List<SiteResponseDTO>>> searchSite(@RequestParam String name) {
        List<SiteResponseDTO> sites = siteService.searchSite(name);
        return ResponseEntity.ok(ApiResponse.success("Sites search results fetched successfully", sites));
    }

    @PutMapping("/activate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_SITE')")
    public ResponseEntity<ApiResponse<SiteResponseDTO>> activateSite(@PathVariable Long id) {
        SiteResponseDTO activated = siteService.activateSite(id);
        return ResponseEntity.ok(ApiResponse.success("Site Activated Successfully", activated));
    }

    @PutMapping("/deactivate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_SITE')")
    public ResponseEntity<ApiResponse<SiteResponseDTO>> deactivateSite(@PathVariable Long id) {
        SiteResponseDTO deactivated = siteService.deactivateSite(id);
        return ResponseEntity.ok(ApiResponse.success("Site Deactivated Successfully", deactivated));
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAuthority('UPDATE_SITE')")
    public ResponseEntity<ApiResponse<SiteResponseDTO>> restoreSite(@PathVariable Long id) {
        SiteResponseDTO restored = siteService.restoreSite(id);
        return ResponseEntity.ok(ApiResponse.success("Site Restored Successfully", restored));
    }
}
