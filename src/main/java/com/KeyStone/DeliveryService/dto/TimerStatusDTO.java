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
public class TimerStatusDTO {

    private Long timeLogId;
    private Long workOrderId;
    private String workOrderNumber;
    private String status;
    private LocalDateTime startTime;
    private Long currentDurationMinutes;
}
