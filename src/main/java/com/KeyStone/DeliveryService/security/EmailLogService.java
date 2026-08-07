package com.KeyStone.DeliveryService.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.KeyStone.DeliveryService.dto.EmailLogDTO;
import com.KeyStone.DeliveryService.entity.EmailLog;
import com.KeyStone.DeliveryService.repository.EmailLogRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailLogService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private EmailLogRepository emailLogRepo;

    public void sendResetPasswordMail(String to, String token) {
        String resetPasswordLink =
                "http://localhost:8081/api/user_auth/reset_password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset Your Password");
        message.setText("Click the link below to reset your password:\n" + resetPasswordLink);

        javaMailSender.send(message);
    }

    public String notification(EmailLogDTO email) {
        boolean sentStatus = false;

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email.getRecipientEmail());
            helper.setSubject(email.getSubject());
            helper.setText(email.getBody());

            if (email.getCcEmail() != null && !email.getCcEmail().isEmpty()) {
                helper.setCc(email.getCcEmail());
            }

            javaMailSender.send(message);
            sentStatus = true;
        } catch (MessagingException e) {
            sentStatus = false;
        }

        EmailLog emailLog = new EmailLog(
                email.getRecipientEmail(),
                email.getSubject(),
                email.getBody(),
                sentStatus);

        emailLogRepo.save(emailLog);

        return sentStatus ? "Email sent successfully" : "Email sending failed";
    }

    public void sendWelcomeMail(String to, String customerName, String customerCode) {
        boolean sentStatus = false;
        String subject = "Welcome to KEYSTONE Delivery Service Management";
        String body = String.format(
            "Hello %s,\n\nWelcome to KEYSTONE Delivery Service Management System!\n\n" +
            "Your Customer Account has been successfully created.\n" +
            "Customer Code: %s\n" +
            "Registered Email: %s\n\n" +
            "You can now log in to the Customer Portal, add your sites, and raise work order requests.\n\n" +
            "Best regards,\nKEYSTONE Team",
            customerName, customerCode, to
        );

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            javaMailSender.send(message);
            sentStatus = true;
        } catch (Exception e) {
            sentStatus = false;
        }

        EmailLog emailLog = new EmailLog(to, subject, body, sentStatus);
        emailLogRepo.save(emailLog);
    }
}
