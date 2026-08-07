package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianPerformanceDTO {

    private Long technicianId;
    private String technicianName;
    private String technicianEmail;

    private long jobsAssigned;
    private long jobsCompleted;

    private double avgResolutionTimeHours;
    private double avgResponseTimeHours;

    private double totalHoursWorked;
    private long partsUsedCount;

    private double slaCompliancePercentage;
    private double productivityScore;
}
