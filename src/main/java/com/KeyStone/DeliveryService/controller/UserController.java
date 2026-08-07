package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.UserDTO;
import com.KeyStone.DeliveryService.enums.Role;
import com.KeyStone.DeliveryService.service.UserAuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserAuthService userAuthService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_USER', 'VIEW_WORK_ORDER', 'ASSIGN_WORK_ORDER')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsers(@RequestParam(required = false) Role role) {
        List<UserDTO> users;
        if (role != null) {
            users = userAuthService.getUsersByRole(role);
        } else {
            users = userAuthService.getAllUsers();
        }
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }
}
