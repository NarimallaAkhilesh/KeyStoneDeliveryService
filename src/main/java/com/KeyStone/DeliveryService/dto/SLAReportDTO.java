package com.KeyStone.DeliveryService.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAReportDTO {

    private long totalSLAHistories;
    private long responseBreachedCount;
    private long resolutionBreachedCount;

    private double overallSLACompliancePercentage;
    private double avgResponseTimeHours;
    private double avgResolutionTimeHours;

    private List<SLAHistoryDTO> breachedList;
}
