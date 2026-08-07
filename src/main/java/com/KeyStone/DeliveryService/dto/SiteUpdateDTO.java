package com.KeyStone.DeliveryService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteUpdateDTO {

    private Long customerId;

    @NotBlank(message = "Site name is required")
    private String siteName;

    @NotBlank(message = "Address is required")
    private String address;

    // Optional fields — the frontend does not enforce these
    private String city;

    private String state;

    private String country;

    private String pincode;

    // Latitude and longitude are optional — the frontend does not collect them
    private Double latitude;

    private Double longitude;

    private String contactPerson;

    // Allow empty string — validation skipped when blank
    @Pattern(regexp = "^$|^[0-9]{10}$", message = "Contact phone number must be 10 digits")
    private String contactPhone;

    @Email(message = "Invalid email format")
    private String contactEmail;
}
