package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerReportDTO {

    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;

    private long activeSitesCount;
    private long totalWorkOrdersCount;
    private long completedWorkOrdersCount;
    private long pendingWorkOrdersCount;

    private double slaCompliancePercentage;
}
