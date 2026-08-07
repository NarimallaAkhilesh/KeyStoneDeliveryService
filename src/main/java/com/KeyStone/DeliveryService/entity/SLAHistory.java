package com.KeyStone.DeliveryService.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "sla_histories", indexes = {
    @Index(name = "idx_slah_work_order_id", columnList = "work_order_id"),
    @Index(name = "idx_slah_response_breached", columnList = "responseBreached"),
    @Index(name = "idx_slah_resolution_breached", columnList = "resolutionBreached")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false, unique = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sla_config_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SLAConfiguration slaConfiguration;

    @Column(nullable = false)
    private LocalDateTime responseDeadline;

    @Column(nullable = false)
    private LocalDateTime resolutionDeadline;

    private LocalDateTime firstResponseAt;

    private LocalDateTime completedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean responseBreached = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean resolutionBreached = false;

    @Column(length = 1000)
    private String breachReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.responseBreached == null) {
            this.responseBreached = false;
        }
        if (this.resolutionBreached == null) {
            this.resolutionBreached = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
