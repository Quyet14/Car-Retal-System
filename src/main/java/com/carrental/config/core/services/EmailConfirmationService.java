package com.carrental.config.core.services;

import com.carrental.config.core.entities.ApplicationUser;
import com.carrental.config.core.interfaces.IEmailConfirmationService;
import com.carrental.config.core.interfaces.IEmailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Triển khai logic gửi email xác nhận và đặt lại mật khẩu.
 */
@Service
public class EmailConfirmationService implements IEmailConfirmationService {

    private final IEmailSender emailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    public EmailConfirmationService(IEmailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Override
    public void sendConfirmationEmailAsync(ApplicationUser user) {
        String token = UUID.randomUUID().toString();

        String confirmationUrl = String.format("%s/api/auth/confirm-email?userId=%s&token=%s",
                baseUrl, user.getId(), token);

        String subject = "Xác nhận địa chỉ Email của bạn";
        String message = String.format("Chào %s,\n\nVui lòng nhấp vào liên kết sau để xác nhận email của bạn:\n%s",
                user.getFirstName(), confirmationUrl);

        emailSender.sendEmailAsync(user.getEmail(), subject, message);
    }

    @Override
    public void sendPasswordResetEmailAsync(ApplicationUser user) {
        String token = UUID.randomUUID().toString();

        String resetUrl = String.format("%s/api/auth/reset-password?userId=%s&token=%s",
                baseUrl, user.getId(), token);

        String subject = "Đặt lại mật khẩu";
        String message = String.format("Chào %s,\n\nVui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:\n%s",
                user.getFirstName(), resetUrl);

        emailSender.sendEmailAsync(user.getEmail(), subject, message);
    }
}
