package com.carrental.config.controllers;

import com.carrental.config.core.dtos.CarResponse;
import com.carrental.config.core.dtos.CreateCarCommand;
import com.carrental.config.core.entities.Car;
import com.carrental.config.core.entities.CarBrand;
import com.carrental.config.core.entities.Location;
import com.carrental.config.core.repositories.CarRepository;
import com.carrental.config.core.repositories.CarBrandRepository;
import com.carrental.config.core.repositories.LocationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cars")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class AdminCarController {

    private final CarRepository carRepository;
    private final CarBrandRepository carBrandRepository;
    private final LocationRepository locationRepository;

    @PostMapping
    public ResponseEntity<?> createCar(@Valid @RequestBody CreateCarCommand command) {
        try {
            // Find or create brand
            CarBrand brand = carBrandRepository.findByName(command.getMake())
                    .orElseGet(() -> {
                        CarBrand newBrand = CarBrand.builder()
                                .name(command.getMake())
                                .build();
                        return carBrandRepository.save(newBrand);
                    });
            
            // Find or create location
            Location location = locationRepository.findByName(command.getLocation())
                    .orElseGet(() -> {
                        Location newLocation = Location.builder()
                                .name(command.getLocation())
                                .slug(command.getLocation().toLowerCase().replace(" ", "-"))
                                .type("Thành phố")
                                .nameWithType(command.getLocation())
                                .code(String.valueOf(System.currentTimeMillis() % 100))
                                .build();
                        return locationRepository.save(newLocation);
                    });
            
            // Create and save car
            Car car = Car.builder()
                    .make(brand)
                    .model(command.getModel())
                    .year(command.getYear())
                    .location(location)
                    .amount(command.getAmount())
                    .imageName(command.getImageName() != null ? command.getImageName() : "")
                    .build();
            
            carRepository.save(car);
            return ResponseEntity.ok().body("Đã thêm xe thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi thêm xe: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCar(@PathVariable Integer id, @Valid @RequestBody CreateCarCommand command) {
        try {
            Car car = carRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
            
            // Find or create brand
            CarBrand brand = carBrandRepository.findByName(command.getMake())
                    .orElseGet(() -> {
                        CarBrand newBrand = CarBrand.builder()
                                .name(command.getMake())
                                .build();
                        return carBrandRepository.save(newBrand);
                    });
            
            // Find or create location
            Location location = locationRepository.findByName(command.getLocation())
                    .orElseGet(() -> {
                        Location newLocation = Location.builder()
                                .name(command.getLocation())
                                .slug(command.getLocation().toLowerCase().replace(" ", "-"))
                                .type("Thành phố")
                                .nameWithType(command.getLocation())
                                .code(String.valueOf(System.currentTimeMillis() % 100))
                                .build();
                        return locationRepository.save(newLocation);
                    });
            
            // Update car
            car.setMake(brand);
            car.setModel(command.getModel());
            car.setYear(command.getYear());
            car.setLocation(location);
            car.setAmount(command.getAmount());
            car.setImageName(command.getImageName() != null ? command.getImageName() : "");
            
            carRepository.save(car);
            return ResponseEntity.ok().body("Đã cập nhật xe thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi cập nhật xe: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Integer id) {
        try {
            carRepository.deleteById(id);
            return ResponseEntity.ok().body("Car deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting car: " + e.getMessage());
        }
    }
}
