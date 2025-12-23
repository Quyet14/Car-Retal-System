package com.carrental.config.core.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
// 1. Sửa tên bảng khớp với DB (CarImages)
@Table(name = "CarImages")
public class CarImage extends GenericEntity {
    @Column(name = "Link", nullable = false)
    private String link;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;
}