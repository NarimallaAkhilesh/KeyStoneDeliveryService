package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLogDTO {

    // Fields used by the notification history listing (Module 8)
    private Long id;
    private String recipientEmail;
    private String subject;
    private boolean sentStatus;
    private LocalDateTime sentAt;

    // Fields used by legacy EmailLogService (Module 1 Authentication)
    private String ccEmail;
    private String body;
}
