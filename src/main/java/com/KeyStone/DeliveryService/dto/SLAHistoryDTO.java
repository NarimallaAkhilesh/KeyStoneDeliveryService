package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import com.KeyStone.DeliveryService.enums.Priority;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAHistoryDTO {

    private Long id;
    private Long workOrderId;
    private String workOrderNumber;
    private String workOrderTitle;
    private Priority priority;

    private LocalDateTime responseDeadline;
    private LocalDateTime resolutionDeadline;
    private LocalDateTime firstResponseAt;
    private LocalDateTime completedAt;

    private Boolean responseBreached;
    private Boolean resolutionBreached;
    private String breachReason;

    private Boolean isOverdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
