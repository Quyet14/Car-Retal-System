package com.carrental.config.core.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordCommand {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
