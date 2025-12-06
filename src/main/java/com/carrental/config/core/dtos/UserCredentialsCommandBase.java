package com.carrental.config.core.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Lớp cơ sở cho các Command yêu cầu Email và Password.
 */
@Data
public abstract class UserCredentialsCommandBase {

    @NotEmpty(message = "Email is required.")
    @Email(message = "Invalid email format.")
    private String email;

    @NotEmpty(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    private String password;
}