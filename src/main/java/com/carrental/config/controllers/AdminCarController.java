package com.carrental.config.controllers;

import com.carrental.config.core.dtos.CarResponse;
import com.carrental.config.core.dtos.CreateCarCommand;
import com.carrental.config.core.entities.Car;
import com.carrental.config.core.entities.CarBrand;
import com.carrental.config.core.entities.CarImage;
import com.carrental.config.core.entities.Location;
import com.carrental.config.core.repositories.CarImageRepository;
import com.carrental.config.core.repositories.CarRepository;
import com.carrental.config.core.repositories.CarBrandRepository;
import com.carrental.config.core.repositories.LocationRepository;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/api/admin/cars")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class AdminCarController {

    private final CarRepository carRepository;
    private final CarBrandRepository carBrandRepository;
    private final LocationRepository locationRepository;

    private final CarImageRepository carImageRepository;
    private final Path uploadDir = Paths.get("uploads");

    // Create folder if not exists
    @PostConstruct
    public void init() throws IOException {
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
    }

    // ============================
    // CREATE CAR (multipart/form-data)
    // ============================
// ... (Các phần trên giữ nguyên)

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createCar(
            @RequestParam String make,
            @RequestParam String model,
            @RequestParam Integer year,
            @RequestParam Double amount,
            @RequestParam String location,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String imageName,
            @RequestParam(required = false) List<MultipartFile> gallery // Nhận list ảnh
    ) {
        try {
            // 1. Xử lý Brand & Location (Giữ nguyên)
            CarBrand brand = carBrandRepository.findByName(make)
                    .orElseGet(() -> carBrandRepository.save(CarBrand.builder().name(make).build()));
            Location loc = locationRepository.findByName(location)
                    .orElseGet(() -> locationRepository.save(Location.builder().name(location).slug(location.toLowerCase().replace(" ", "-")).type("Thành phố").nameWithType(location).code(String.valueOf(System.currentTimeMillis() % 100)).build()));

            // 2. Xử lý ảnh đại diện chính (Giữ nguyên)
            String finalImageName = "";
            if (file != null && !file.isEmpty()) {
                finalImageName = saveFile(file);
            } else if (imageName != null && !imageName.isEmpty()) {
                finalImageName = imageName;
            }

            // 3. Tạo xe và Lưu xe
            Car car = Car.builder()
                    .make(brand).model(model).year(year).amount(amount).location(loc)
                    .imageName(finalImageName)
                    .build();

            Car savedCar = carRepository.save(car);
            // --- ĐÃ XÓA DÒNG RETURN Ở ĐÂY ĐỂ CODE CHẠY TIẾP ---

            // 4. XỬ LÝ LƯU GALLERY (Bây giờ code sẽ chạy đến đây)
            if (gallery != null && !gallery.isEmpty()) {
                for (MultipartFile f : gallery) {
                    if (!f.isEmpty()) {
                        String link = saveFile(f);
                        CarImage carImage = new CarImage();
                        carImage.setLink(link);
                        carImage.setCar(savedCar);
                        carImageRepository.save(carImage);
                    }
                }
            }

            // 5. Trả về kết quả cuối cùng
            return ResponseEntity.ok("Đã thêm xe và ảnh chi tiết thành công!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi thêm xe: " + e.getMessage());
        }
    }

    // ============================
    // UPDATE CAR (multipart/form-data)
    // ============================
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateCar(
            @PathVariable Integer id,
            @RequestParam String make,
            @RequestParam String model,
            @RequestParam Integer year,
            @RequestParam Double amount,
            @RequestParam String location,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String imageName,
            @RequestParam(required = false) List<MultipartFile> gallery
    ) {
        try {
            Car car = carRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

            // Brand
            CarBrand brand = carBrandRepository.findByName(make)
                    .orElseGet(() -> carBrandRepository.save(
                            CarBrand.builder().name(make).build()
                    ));

            // Location
            Location loc = locationRepository.findByName(location)
                    .orElseGet(() -> locationRepository.save(
                            Location.builder()
                                    .name(location)
                                    .slug(location.toLowerCase().replace(" ", "-"))
                                    .type("Thành phố")
                                    .nameWithType(location)
                                    .code(String.valueOf(System.currentTimeMillis() % 100))
                                    .build()
                    ));

            String finalImageName = car.getImageName();

            // CASE 1 — Upload file mới
            if (file != null && !file.isEmpty()) {
                finalImageName = saveFile(file);
            }

            // CASE 2 — Dùng link URL mới
            else if (imageName != null && !imageName.isEmpty()) {
                finalImageName = imageName;
            }

            car.setMake(brand);
            car.setModel(model);
            car.setYear(year);
            car.setAmount(amount);
            car.setLocation(loc);
            car.setImageName(finalImageName);

            Car savedCar = carRepository.save(car);

            if (gallery != null && !gallery.isEmpty()) {
                for (MultipartFile f : gallery) {
                    if (!f.isEmpty()) {
                        String link = saveFile(f);
                        CarImage carImage = new CarImage();
                        carImage.setLink(link);
                        carImage.setCar(savedCar);
                        carImageRepository.save(carImage);
                    }
                }
            }

            return ResponseEntity.ok("Đã cập nhật xe thành công!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi cập nhật xe: " + e.getMessage());
        }
    }

    // ============================
    // DELETE CAR
    // ============================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Integer id) {
        try {
            carRepository.deleteById(id);
            return ResponseEntity.ok("Đã xóa xe");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi xóa xe: " + e.getMessage());
        }
    }

    // ============================
    // SAVE FILE FUNCTION
    // ============================
    private String saveFile(MultipartFile file) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path targetPath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + fileName;
    }
}
