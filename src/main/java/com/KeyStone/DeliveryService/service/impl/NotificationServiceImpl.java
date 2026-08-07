package com.KeyStone.DeliveryService.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.DeliveryService.dto.EmailLogDTO;
import com.KeyStone.DeliveryService.dto.NotificationDTO;
import com.KeyStone.DeliveryService.entity.EmailLog;
import com.KeyStone.DeliveryService.entity.Part;
import com.KeyStone.DeliveryService.entity.SLAHistory;
import com.KeyStone.DeliveryService.entity.WorkOrder;
import com.KeyStone.DeliveryService.repository.EmailLogRepository;
import com.KeyStone.DeliveryService.service.NotificationService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender javaMailSender;
    private final EmailLogRepository emailLogRepository;

    @Override
    public String sendEmail(NotificationDTO notification) {
        boolean sentStatus = false;
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(notification.getRecipientEmail());
            helper.setSubject(notification.getSubject());
            helper.setText(notification.getBody(), true);

            javaMailSender.send(message);
            sentStatus = true;
            log.info("Email sent successfully to: {}", notification.getRecipientEmail());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", notification.getRecipientEmail(), e.getMessage());
        }

        EmailLog emailLog = EmailLog.builder()
                .recipientEmail(notification.getRecipientEmail())
                .subject(notification.getSubject())
                .body(notification.getBody())
                .sentStatus(sentStatus)
                .build();

        emailLogRepository.save(emailLog);
        return sentStatus ? "Email sent successfully" : "Email sending failed";
    }

    @Override
    @Async("notificationTaskExecutor")
    public void notifyWorkOrderCreated(WorkOrder workOrder) {
        if (workOrder.getCustomer() != null && workOrder.getCustomer().getEmail() != null) {
            String subject = "Work Order Created: " + workOrder.getWorkOrderNumber();
            String body = String.format(
                "<div style='font-family:Arial,sans-serif;'>" +
                "<h2 style='color:#2563eb;'>Work Order Created</h2>" +
                "<p>Dear <b>%s</b>,</p>" +
                "<p>Your Work Order <b>%s</b> – <i>%s</i> has been created successfully.</p>" +
                "<p><b>Priority:</b> %s</p>" +
                "<p style='color:#6b7280;font-size:12px;'>KEYSTONE Delivery Service</p></div>",
                workOrder.getCustomer().getCustomerName(),
                workOrder.getWorkOrderNumber(),
                workOrder.getTitle(),
                workOrder.getPriority());

            sendEmail(NotificationDTO.builder()
                    .recipientEmail(workOrder.getCustomer().getEmail())
                    .subject(subject)
                    .body(body)
                    .build());
        }
    }

    @Override
    @Async("notificationTaskExecutor")
    public void notifyTechnicianAssigned(WorkOrder workOrder) {
        if (workOrder.getAssignedTechnician() != null && workOrder.getAssignedTechnician().getUserEmail() != null) {
            String subject = "New Work Order Assigned: " + workOrder.getWorkOrderNumber();
            String body = String.format(
                "<div style='font-family:Arial,sans-serif;'>" +
                "<h2 style='color:#2563eb;'>Work Order Assigned</h2>" +
                "<p>Hello <b>%s</b>,</p>" +
                "<p>You have been assigned Work Order <b>%s</b> – <i>%s</i>.</p>" +
                "<p><b>Priority:</b> %s</p>" +
                "<p>Please review and begin as soon as possible.</p>" +
                "<p style='color:#6b7280;font-size:12px;'>KEYSTONE Delivery Service</p></div>",
                workOrder.getAssignedTechnician().getUserName(),
                workOrder.getWorkOrderNumber(),
                workOrder.getTitle(),
                workOrder.getPriority());

            sendEmail(NotificationDTO.builder()
                    .recipientEmail(workOrder.getAssignedTechnician().getUserEmail())
                    .subject(subject)
                    .body(body)
                    .build());
        }
    }

    @Override
    @Async("notificationTaskExecutor")
    public void notifyStatusChanged(WorkOrder workOrder, String oldStatus, String newStatus) {
        if (workOrder.getCustomer() != null && workOrder.getCustomer().getEmail() != null) {
            String subject = "Work Order Status Update: " + workOrder.getWorkOrderNumber();
            String body = String.format(
                "<div style='font-family:Arial,sans-serif;'>" +
                "<h2 style='color:#2563eb;'>Status Update</h2>" +
                "<p>Dear <b>%s</b>,</p>" +
                "<p>Work Order <b>%s</b> status changed from <b>%s</b> → <b>%s</b>.</p>" +
                "<p style='color:#6b7280;font-size:12px;'>KEYSTONE Delivery Service</p></div>",
                workOrder.getCustomer().getCustomerName(),
                workOrder.getWorkOrderNumber(),
                oldStatus,
                newStatus);

            sendEmail(NotificationDTO.builder()
                    .recipientEmail(workOrder.getCustomer().getEmail())
                    .subject(subject)
                    .body(body)
                    .build());
        }
    }

    @Override
    @Async("notificationTaskExecutor")
    public void notifyLowStock(Part part) {
        String subject = "⚠️ Low Stock Alert: " + part.getPartCode() + " – " + part.getPartName();
        String body = String.format(
            "<div style='font-family:Arial,sans-serif;'>" +
            "<h2 style='color:#dc2626;'>Low Stock Alert</h2>" +
            "<p>Part <b>%s</b> (<code>%s</code>) is below minimum stock threshold.</p>" +
            "<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;'>" +
            "<tr><td><b>Available</b></td><td>%d</td></tr>" +
            "<tr><td><b>Minimum Threshold</b></td><td>%d</td></tr>" +
            "</table>" +
            "<p>Please restock immediately.</p>" +
            "<p style='color:#6b7280;font-size:12px;'>KEYSTONE Delivery Service – Automated Alert</p></div>",
            part.getPartName(), part.getPartCode(),
            part.getQuantityAvailable(), part.getMinimumStock());

        log.warn("Low Stock Alert triggered for Part: {} ({}), available: {}",
                part.getPartName(), part.getPartCode(), part.getQuantityAvailable());

        // Log only — manager email resolution handled by scheduler
        EmailLog emailLog = EmailLog.builder()
                .recipientEmail("system-alert@keystone.internal")
                .subject(subject)
                .body(body)
                .sentStatus(false)
                .build();
        emailLogRepository.save(emailLog);
    }

    @Override
    @Async("notificationTaskExecutor")
    public void notifySLAWarning(SLAHistory history) {
        if (history.getWorkOrder() == null) return;

        String subject = "⏰ SLA Deadline Warning: " + history.getWorkOrder().getWorkOrderNumber();
        String body = String.format(
            "<div style='font-family:Arial,sans-serif;'>" +
            "<h2 style='color:#d97706;'>SLA Deadline Approaching</h2>" +
            "<p>Work Order <b>%s</b> – <i>%s</i> is approaching its SLA deadline.</p>" +
            "<p><b>Resolution Deadline:</b> %s</p>" +
            "<p>Please take immediate action to avoid an SLA breach.</p>" +
            "<p style='color:#6b7280;font-size:12px;'>KEYSTONE Delivery Service – SLA Monitor</p></div>",
            history.getWorkOrder().getWorkOrderNumber(),
            history.getWorkOrder().getTitle(),
            history.getResolutionDeadline());

        log.warn("SLA Warning notification for Work Order: {}", history.getWorkOrder().getWorkOrderNumber());

        EmailLog emailLog = EmailLog.builder()
                .recipientEmail("sla-warning@keystone.internal")
                .subject(subject)
                .body(body)
                .sentStatus(false)
                .build();
        emailLogRepository.save(emailLog);
    }

    @Override
    @Async("notificationTaskExecutor")
    public void notifySLABreach(SLAHistory history) {
        if (history.getWorkOrder() == null) return;

        String subject = "🚨 CRITICAL – SLA Breached: " + history.getWorkOrder().getWorkOrderNumber();
        String body = String.format(
            "<div style='font-family:Arial,sans-serif;'>" +
            "<h2 style='color:#dc2626;'>SLA Breached</h2>" +
            "<p>Work Order <b>%s</b> – <i>%s</i> has breached its SLA target.</p>" +
            "<p><b>Breach Reason:</b> %s</p>" +
            "<p><b>Response Breached:</b> %s | <b>Resolution Breached:</b> %s</p>" +
            "<p style='color:#6b7280;font-size:12px;'>KEYSTONE Delivery Service – SLA Monitor</p></div>",
            history.getWorkOrder().getWorkOrderNumber(),
            history.getWorkOrder().getTitle(),
            history.getBreachReason() != null ? history.getBreachReason() : "Deadline Exceeded",
            history.getResponseBreached(),
            history.getResolutionBreached());

        log.error("SLA Breach for Work Order: {}", history.getWorkOrder().getWorkOrderNumber());

        EmailLog emailLog = EmailLog.builder()
                .recipientEmail("sla-breach@keystone.internal")
                .subject(subject)
                .body(body)
                .sentStatus(false)
                .build();
        emailLogRepository.save(emailLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmailLogDTO> getEmailLogs() {
        return emailLogRepository.findAll().stream()
                .map(log -> EmailLogDTO.builder()
                        .id(log.getId())
                        .recipientEmail(log.getRecipientEmail())
                        .subject(log.getSubject())
                        .sentStatus(log.isSentStatus())
                        .sentAt(log.getSentAt())
                        .build())
                .collect(Collectors.toList());
    }
}
