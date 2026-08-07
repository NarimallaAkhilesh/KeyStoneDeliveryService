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
public class InventoryReportDTO {

    private long totalCatalogParts;
    private long lowStockPartsCount;
    private double totalInventoryValue;

    private String mostUsedPartName;
    private String mostUsedPartCode;
    private long totalPartsUsedCount;

    private List<PartResponseDTO> partsList;
}
