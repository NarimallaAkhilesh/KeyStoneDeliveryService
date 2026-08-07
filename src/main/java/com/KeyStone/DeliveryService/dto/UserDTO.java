package com.KeyStone.DeliveryService.dto;

import com.KeyStone.DeliveryService.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String userName;
    private String userEmail;
    private String phone;
    private Role role;
}
