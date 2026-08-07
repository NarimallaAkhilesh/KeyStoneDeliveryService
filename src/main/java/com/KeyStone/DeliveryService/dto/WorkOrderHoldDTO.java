package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderHoldDTO {

    @NotBlank(message = "Hold reason is required")
    private String holdReason;

    private LocalDateTime expectedResumeDate;

    private String remarks;
}
