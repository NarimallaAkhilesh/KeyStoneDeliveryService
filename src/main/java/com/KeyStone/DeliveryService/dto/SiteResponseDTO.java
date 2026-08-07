package com.KeyStone.DeliveryService.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteResponseDTO {

    private Long id;
    private String siteCode;
    private String siteName;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long customerId;
    private String customerName;
    private String customerCode;
}
