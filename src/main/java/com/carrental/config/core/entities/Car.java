package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

/**
 * Đại diện cho xe cho thuê.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MakeId", nullable = false, columnDefinition = "NVARCHAR(450)")
    private CarBrand make;

    @Column(name = "Model", nullable = false)
    private String model;

    @Column(name = "Year", nullable = false)
    private Integer year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "LocationId", nullable = false, columnDefinition = "NVARCHAR(450)")
    private Location location;

    @Column(name = "ImageName", length = 256, nullable = false)
    private String imageName = "";

    @Column(name = "Amount", nullable = false)
    private Double amount; 

    // Tạm thời comment isDeleted
    // @Column(name = "IsDeleted", nullable = false)
    // private Boolean isDeleted = false;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Reservation> reservations = new HashSet<>();

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    //@com.fasterxml.jackson.annotation.JsonIgnore
    private Set<CarImage> images = new HashSet<>();
}