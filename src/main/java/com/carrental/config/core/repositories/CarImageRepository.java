package com.carrental.config.core.repositories;

import com.carrental.config.core.entities.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarImageRepository extends JpaRepository<CarImage, String> {
    // Tìm tất cả ảnh phụ của một xe cụ thể
    List<CarImage> findByCarId(Integer carId);

    void deleteByCarId(Integer carId);
}

