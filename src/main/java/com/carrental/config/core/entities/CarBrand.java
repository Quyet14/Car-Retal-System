package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

/**
 * Đại diện cho hãng xe.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "CarBrands")
public class CarBrand extends GenericEntity {

    @Column(name = "Name", nullable = false)
    private String name;

    @OneToMany(mappedBy = "make", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Car> cars = new HashSet<>();
}