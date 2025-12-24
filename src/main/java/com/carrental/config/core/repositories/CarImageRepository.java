package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarImageRepository extends JpaRepository<CarImage, Long> {
    // Tìm tất cả ảnh phụ của một xe cụ thể (nếu cần dùng sau này)
    List<CarImage> findByCarId(Integer carId);
}


import java.util.List;

public interface CarImageRepository extends JpaRepository<CarImage, String> {
    List<CarImage> findByCar_Id(Integer carId);

    void deleteByCar_Id(Integer carId);
}

