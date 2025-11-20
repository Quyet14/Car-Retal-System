package com.carrental.config.core.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmEmailCommand {
    
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Token is required")
    private String token;
}
