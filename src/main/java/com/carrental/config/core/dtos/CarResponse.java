package com.carrental.config.core.dtos;

import com.carrental.config.core.entities.ApplicationUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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

    private List<String> gallery;
    private Integer seats;
    private String transmission;
    private String fuel;

    private String ownerName;
}
