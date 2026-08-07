package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.enums.Priority;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAConfigurationDTO {

    private Long id;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Response time in hours is required")
    @Positive(message = "Response time must be greater than zero")
    private Integer responseTimeHours;

    @NotNull(message = "Resolution time in hours is required")
    @Positive(message = "Resolution time must be greater than zero")
    private Integer resolutionTimeHours;

    private Boolean active;
}
