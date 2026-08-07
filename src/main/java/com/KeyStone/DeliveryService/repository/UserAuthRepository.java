package com.KeyStone.DeliveryService.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.UserAuth;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {

    Optional<UserAuth> findByUserEmail(String userEmail);

    Optional<UserAuth> findByResetToken(String resetToken);

    java.util.List<UserAuth> findByRole(com.KeyStone.DeliveryService.enums.Role role);

    long countByRole(com.KeyStone.DeliveryService.enums.Role role);
}