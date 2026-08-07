package com.KeyStone.DeliveryService.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.Site;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {

    boolean existsBySiteCode(String siteCode);

    Optional<Site> findBySiteCode(String siteCode);

    List<Site> findBySiteNameContainingIgnoreCase(String name);

    List<Site> findByCustomerId(Long customerId);

    List<Site> findByCustomerIdAndActiveTrue(Long customerId);

    List<Site> findByActiveTrue();

    List<Site> findByActiveFalse();

    long countByActiveTrue();

    long countByActiveFalse();

    long countByCustomerIdAndActiveTrue(Long customerId);

    Optional<Site> findTopByOrderByIdDesc();
}
