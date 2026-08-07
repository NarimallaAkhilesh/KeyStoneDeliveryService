package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderCompleteDTO {

    @NotBlank(message = "Resolution summary is required")
    private String resolutionSummary;

    private String remarks;
}
