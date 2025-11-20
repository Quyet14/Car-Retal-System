package com.carrental.config.core.interfaces;

import com.carrental.config.core.entities.ApplicationUser;

public interface IEmailConfirmationService {
    void sendConfirmationEmailAsync(ApplicationUser user);
    void sendPasswordResetEmailAsync(ApplicationUser user);
}
