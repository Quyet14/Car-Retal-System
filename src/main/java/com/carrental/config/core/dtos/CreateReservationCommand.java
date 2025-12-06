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
public class CreateReservationCommand {
    @NotNull(message = "Car ID is required")
    private Integer carId;
    
    @NotNull(message = "Start date is required")
    private String startDate;
    
    @NotNull(message = "End date is required")
    private String endDate;
    
    private String startTime;
    private String endTime;
    private String pickupLocation;
    private String fullName;
    private String phone;
    private String email;
    private String notes;
}
