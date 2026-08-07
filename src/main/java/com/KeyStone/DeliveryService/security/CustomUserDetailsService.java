package com.KeyStone.DeliveryService.security;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.KeyStone.DeliveryService.entity.UserAuth;
import com.KeyStone.DeliveryService.repository.UserAuthRepository;

@Service
public class CustomUserDetailsService {

    @Autowired
    private UserAuthRepository userRepo;

    public UserDetails loadUserByUserEmail(String userEmail) {
        UserAuth user = userRepo.findByUserEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (user.getRole() != null) {
            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            java.util.Set<com.KeyStone.DeliveryService.enums.Permissions> perms = RoleBasedPermissions.getRoleBasedPermissions().get(user.getRole());
            if (perms != null) {
                for (com.KeyStone.DeliveryService.enums.Permissions p : perms) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(p.name()));
                }
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUserEmail(),
                user.getPassword(),
                authorities
        );
    }
}
