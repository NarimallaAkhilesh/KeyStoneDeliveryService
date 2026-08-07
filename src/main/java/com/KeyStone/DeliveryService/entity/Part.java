package com.KeyStone.DeliveryService.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parts", indexes = {
    @Index(name = "idx_part_code", columnList = "partCode"),
    @Index(name = "idx_part_name", columnList = "partName"),
    @Index(name = "idx_part_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String partCode;

    @Column(nullable = false)
    private String partName;

    @Column(length = 2000)
    private String description;

    private String category;
    private String manufacturer;

    @Column(nullable = false)
    private Double unitPrice;

    @Builder.Default
    @Column(nullable = false)
    private Integer quantityAvailable = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer minimumStock = 5;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
        if (this.quantityAvailable == null) {
            this.quantityAvailable = 0;
        }
        if (this.minimumStock == null) {
            this.minimumStock = 5;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
