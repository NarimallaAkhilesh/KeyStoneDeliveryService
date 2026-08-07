package com.KeyStone.DeliveryService.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.KeyStone.DeliveryService.entity.Part;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    boolean existsByPartCode(String partCode);

    Optional<Part> findByPartCode(String partCode);

    List<Part> findByActiveTrue();

    List<Part> findByActiveFalse();

    long countByActiveTrue();

    long countByActiveFalse();

    Optional<Part> findTopByOrderByIdDesc();

    @Query("SELECT p FROM Part p WHERE p.active = true AND p.quantityAvailable <= p.minimumStock")
    List<Part> findLowStockParts();

    List<Part> findByPartNameContainingIgnoreCase(String name);
}
