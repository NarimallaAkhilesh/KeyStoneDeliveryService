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
import com.KeyStone.DeliveryService.dto.CustomerRequestDTO;
import com.KeyStone.DeliveryService.dto.CustomerResponseDTO;
import com.KeyStone.DeliveryService.dto.CustomerUpdateDTO;
import com.KeyStone.DeliveryService.service.CustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> createCustomer(@Valid @RequestBody CustomerRequestDTO request) {
        CustomerResponseDTO created = customerService.createCustomer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer Created Successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CustomerResponseDTO>>> getAllCustomers(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        List<CustomerResponseDTO> customers = customerService.getAllCustomers(status);
        return ResponseEntity.ok(ApiResponse.success("Customers fetched successfully", customers));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> getCustomerById(@PathVariable Long id) {
        CustomerResponseDTO customer = customerService.getCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer details fetched successfully", customer));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('VIEW_CUSTOMER', 'VIEW_OWN_REQUEST', 'RAISE_REQUEST')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> getCurrentCustomerProfile(org.springframework.security.core.Authentication authentication) {
        String userEmail = authentication.getName();
        CustomerResponseDTO customer = customerService.getCustomerByEmail(userEmail);
        return ResponseEntity.ok(ApiResponse.success("Current customer profile fetched successfully", customer));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerUpdateDTO request) {
        CustomerResponseDTO updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Customer Updated Successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer Deactivated Successfully", null));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CustomerResponseDTO>>> searchCustomer(@RequestParam String name) {
        List<CustomerResponseDTO> customers = customerService.searchCustomer(name);
        return ResponseEntity.ok(ApiResponse.success("Customers search results fetched successfully", customers));
    }

    @PutMapping("/activate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> activateCustomer(@PathVariable Long id) {
        CustomerResponseDTO activated = customerService.activateCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer Activated Successfully", activated));
    }

    @PutMapping("/deactivate/{id}")
    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> deactivateCustomer(@PathVariable Long id) {
        CustomerResponseDTO deactivated = customerService.deactivateCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer Deactivated Successfully", deactivated));
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> restoreCustomer(@PathVariable Long id) {
        CustomerResponseDTO restored = customerService.restoreCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer Restored Successfully", restored));
    }
}
