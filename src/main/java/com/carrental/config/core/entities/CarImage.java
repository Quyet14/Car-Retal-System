package com.carrental.config.core.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
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

    // 2. Sửa tên cột khớp với DB (Link)
    @Column(name = "Link", nullable = false)
    private String link;

    @ManyToOne(fetch = FetchType.LAZY)
    // 3. Sửa tên cột khóa ngoại khớp với DB (CarId)
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;
}