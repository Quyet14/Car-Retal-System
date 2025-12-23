package com.carrental.config.controllers;

import com.carrental.config.core.entities.CarImage;
import com.carrental.config.core.dtos.CarResponse;
import com.carrental.config.core.entities.Car;
import com.carrental.config.core.repositories.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class CarController {

    private final CarRepository carRepository;

    @GetMapping
    public ResponseEntity<List<CarResponse>> getAllCars(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Double maxPrice
    ) {
        // Lấy tất cả xe (tạm thời bỏ filter isDeleted)
        List<Car> cars = carRepository.findAll();

        // Apply filters in one pass
        List<CarResponse> response = cars.stream()
                .filter(car -> location == null || location.isEmpty() || 
                              car.getLocation().getName().equalsIgnoreCase(location))
                .filter(car -> brand == null || brand.isEmpty() || 
                              car.getMake().getName().equalsIgnoreCase(brand))
                .filter(car -> year == null || car.getYear().equals(year))
                .filter(car -> maxPrice == null || car.getAmount() <= maxPrice)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarResponse> getCarById(@PathVariable Integer id) {
        return carRepository.findById(id)
                .map(car -> ResponseEntity.ok(mapToResponse(car)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CarResponse>> searchCars(@RequestParam String query) {
        List<Car> cars = carRepository.findAll().stream()
                .filter(car -> 
                    car.getMake().getName().toLowerCase().contains(query.toLowerCase()) ||
                    car.getModel().toLowerCase().contains(query.toLowerCase()) ||
                    car.getLocation().getName().toLowerCase().contains(query.toLowerCase())
                )
                .collect(Collectors.toList());

        List<CarResponse> response = cars.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private CarResponse mapToResponse(Car car) {
        // Lấy danh sách link ảnh
        List<String> galleryLinks = new ArrayList<>();
        if (car.getImages() != null) {
            galleryLinks = car.getImages().stream()
                    .map(CarImage::getLink) // Lấy trường link của CarImage
                    .collect(Collectors.toList());
        }

        return CarResponse.builder()
                .id(car.getId())
                .make(car.getMake().getName())
                .model(car.getModel())
                .year(car.getYear())
                .location(car.getLocation().getName())
                .amount(car.getAmount())
                .imageName(car.getImageName())

                // --- THÊM DÒNG NÀY ---
                .gallery(galleryLinks)

                .seats(5)
                .transmission("Tự động")
                .fuel("Xăng")
                .build();
    }
}
