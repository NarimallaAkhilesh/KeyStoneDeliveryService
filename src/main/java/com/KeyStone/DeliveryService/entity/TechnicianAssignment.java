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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "technician_assignments", indexes = {
    @Index(name = "idx_ta_work_order_id", columnList = "work_order_id"),
    @Index(name = "idx_ta_new_technician_id", columnList = "new_technician_id"),
    @Index(name = "idx_ta_assigned_by_id", columnList = "assigned_by_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WorkOrder workOrder;

    // null on first assignment (no previous technician)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_technician_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserAuth previousTechnician;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_technician_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserAuth newTechnician;

    // The dispatcher or manager who performed this action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserAuth assignedBy;

    // ASSIGNED, REASSIGNED, REMOVED
    @Column(nullable = false)
    private String actionType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
    }
}
