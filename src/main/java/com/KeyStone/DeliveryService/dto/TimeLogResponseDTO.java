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
public class TimeLogResponseDTO {

    private Long id;
    private Long workOrderId;
    private String workOrderNumber;
    private Long technicianId;
    private String technicianName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long totalMinutes;
    private String status;
    private String workDescription;
    private String remarks;
    private LocalDateTime createdAt;
}
