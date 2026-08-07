package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLADashboardDTO {

    private Long totalSLABreaches;
    private Long todayBreaches;
    private Long overdueWorkOrders;
    private Long upcomingDeadlines;
    private Double averageResponseTimeHours;
    private Double averageResolutionTimeHours;
}
