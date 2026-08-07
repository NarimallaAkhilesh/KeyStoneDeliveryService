package com.KeyStone.DeliveryService.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.SLAConfiguration;
import com.KeyStone.DeliveryService.enums.Priority;

@Repository
public interface SLAConfigurationRepository extends JpaRepository<SLAConfiguration, Long> {

    Optional<SLAConfiguration> findByPriority(Priority priority);

    List<SLAConfiguration> findByActiveTrue();
}
