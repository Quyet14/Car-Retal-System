package com.carrental.config.core.interfaces;

public interface IEmailSender {
    void sendEmailAsync(String email, String subject, String message);
}
