package com.KeyStone.DeliveryService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.DeliveryService.dto.ApiResponse;
import com.KeyStone.DeliveryService.dto.EmailLogDTO;
import com.KeyStone.DeliveryService.dto.NotificationDTO;
import com.KeyStone.DeliveryService.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications/emailLogs
     * Returns the full email log history.
     * Access: MANAGER, DISPATCHER
     */
    @GetMapping("/emailLogs")
    @PreAuthorize("hasAnyAuthority('SEND_NOTIFICATION', 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<List<EmailLogDTO>>> getEmailLogs() {
        List<EmailLogDTO> logs = notificationService.getEmailLogs();
        return ResponseEntity.ok(ApiResponse.success("Email Logs Fetched Successfully", logs));
    }

    /**
     * POST /api/notifications/test
     * Sends a test notification email.
     * Access: MANAGER only
     */
    @PostMapping("/test")
    @PreAuthorize("hasAuthority('SEND_NOTIFICATION')")
    public ResponseEntity<ApiResponse<String>> sendTestNotification(@Valid @RequestBody NotificationDTO request) {
        String result = notificationService.sendEmail(request);
        return ResponseEntity.ok(ApiResponse.success(result, null));
    }
}
