package com.carrental.config.core.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Integer id;
    private Integer carId;
    private String carName;
    private String carImage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String statusCode;
    private Double dailyRate;
    private Double totalPrice;
    private Integer days;
    private String pickupLocation;
    private String fullName;
    private String phone;
    private String email;
    private String notes;
}
