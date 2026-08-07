package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianDashboardDTO {

    private Long technicianId;
    private String technicianName;
    private String technicianEmail;

    private long totalAssigned;
    private long pending;
    private long inProgress;
    private long completed;
    private long cancelled;
}
