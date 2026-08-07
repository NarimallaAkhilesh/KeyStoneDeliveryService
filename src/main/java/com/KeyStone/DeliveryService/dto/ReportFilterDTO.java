package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.enums.Priority;
import com.KeyStone.DeliveryService.enums.WorkOrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportFilterDTO {

    private String startDate;
    private String endDate;

    private Long customerId;
    private Long siteId;
    private Long technicianId;

    private Priority priority;
    private WorkOrderStatus status;
}
