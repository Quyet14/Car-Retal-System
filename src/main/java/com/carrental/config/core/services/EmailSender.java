package com.carrental.config.core.services;

import com.carrental.config.core.interfaces.IEmailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Triển khai dịch vụ gửi email.
 */
@Service
public class EmailSender implements IEmailSender {

    private final JavaMailSender mailSender;

    public EmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @Override
    public void sendEmailAsync(String email, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(email);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);

            mailSender.send(mailMessage);
            System.out.println("Email sent successfully to: " + email + " with subject: " + subject);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + email + ". Error: " + e.getMessage());
        }
    }
}
