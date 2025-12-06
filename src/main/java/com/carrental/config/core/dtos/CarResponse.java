package com.carrental.config.core.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarResponse {
    private Integer id;
    private String make;
    private String model;
    private Integer year;
    private String location;
    private Double amount;
    private String imageName;
    private Integer seats;
    private String transmission;
    private String fuel;
}
