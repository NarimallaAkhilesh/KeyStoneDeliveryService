package com.KeyStone.DeliveryService.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "email_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientEmail;
    private String ccEmail;
    private String subject;

    @Column(length = 5000)
    private String body;

    private boolean sentStatus;

    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    public EmailLog(String recipientEmail, String subject, String body, boolean sentStatus) {
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.body = body;
        this.sentStatus = sentStatus;
        this.sentAt = LocalDateTime.now();
    }
}
