package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderDashboardDTO {

    private long totalWorkOrders;
    private long open;
    private long assigned;
    private long inProgress;
    private long onHold;
    private long completed;
    private long cancelled;
    private long todayCompleted;
}
