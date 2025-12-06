package com.carrental.config.core.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCarCommand {
    @NotNull(message = "Make is required")
    private String make;
    
    @NotNull(message = "Model is required")
    private String model;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    @NotNull(message = "Location is required")
    private String location;
    
    @NotNull(message = "Amount is required")
    private Double amount;
    
    private String imageName;
}
