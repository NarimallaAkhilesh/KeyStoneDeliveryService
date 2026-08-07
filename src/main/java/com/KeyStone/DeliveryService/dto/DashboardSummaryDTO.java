package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {

    private long totalCustomers;
    private long activeCustomers;
    private long totalSites;
    private long activeSites;

    private long totalWorkOrders;
    private long openWorkOrders;
    private long assignedWorkOrders;
    private long inProgressWorkOrders;
    private long onHoldWorkOrders;
    private long completedWorkOrders;
    private long cancelledWorkOrders;

    private long todaysWorkOrders;
    private long todaysCompletedWorkOrders;

    private long slaBreaches;
    private long upcomingSLADeadlines;

    private long totalParts;
    private long lowStockParts;

    private long totalTechnicians;
    private long activeTechnicians;
}
