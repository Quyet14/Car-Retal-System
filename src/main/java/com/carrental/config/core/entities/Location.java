package com.carrental.config.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashSet;
import java.util.Set;

/**
 * Đại diện cho vị trí (Tỉnh/Thành phố).
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "Locations")
public class Location extends GenericEntity {

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Slug", nullable = false)
    private String slug;

    @Column(name = "Type", nullable = false)
    private String type;

    @Column(name = "NameWithType", nullable = false)
    @JsonProperty("name_with_type") 
    private String nameWithType;

    @Column(name = "Code", nullable = false)
    private String code;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Car> cars = new HashSet<>();
}