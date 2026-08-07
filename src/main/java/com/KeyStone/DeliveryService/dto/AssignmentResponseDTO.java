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
public class AssignmentResponseDTO {

    private Long workOrderId;
    private String workOrderNumber;
    private String workOrderTitle;

    private Long technicianId;
    private String technicianName;
    private String technicianEmail;

    private Long previousTechnicianId;
    private String previousTechnicianName;

    private Long assignedById;
    private String assignedByName;

    private String actionType;
    private LocalDateTime assignedAt;
}
