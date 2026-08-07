package com.KeyStone.DeliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportRequestDTO {

    // TECHNICIAN, CUSTOMER, INVENTORY, SLA, SUMMARY
    private String reportType;

    // CSV, EXCEL, PDF
    private String format;

    private ReportFilterDTO filter;
}
