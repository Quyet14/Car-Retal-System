package com.carrental.config.controllers;

import com.carrental.config.core.dtos.CarConsignDTO;
import com.carrental.config.core.dtos.CarResponse;
import com.carrental.config.core.entities.*;
import com.carrental.config.core.entities.ApplicationUser;
import com.carrental.config.core.repositories.*;
import com.carrental.config.enums.CarStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime; // Import cái này để lưu ngày tạo
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:9090"}, allowCredentials = "true")
public class CarController {

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final CarBrandRepository carBrandRepository;
    private final LocationRepository locationRepository;

    private final String UPLOAD_DIR = "src/main/resources/static/images/cars/";

    @PostMapping("/consign")
    public ResponseEntity<?> consignCar(@ModelAttribute CarConsignDTO dto) {
        try {
            // 1. Tìm chủ xe
            ApplicationUser owner = userRepository.findById(dto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

            // 2. XỬ LÝ HÃNG XE (Fix lỗi IsDeleted cho Brand)
            CarBrand brand = carBrandRepository.findByName(dto.getMake())
                    .orElseGet(() -> carBrandRepository.save(
                            CarBrand.builder()
                                    .name(dto.getMake())
                                    .isDeleted(false) // Bắt buộc
                                    .dateCreate(LocalDateTime.now()) // Nên có để tránh lỗi DateCreate NULL
                                    .build()
                    ));

            // 3. XỬ LÝ ĐỊA ĐIỂM (Fix lỗi IsDeleted cho Location - Lỗi bạn đang gặp)
            Location location = locationRepository.findByName(dto.getLocation())
                    .orElseGet(() -> locationRepository.save(
                            Location.builder()
                                    .name(dto.getLocation())
                                    .slug(dto.getLocation().toLowerCase().replace(" ", "-"))
                                    .type("Thành phố")
                                    .nameWithType(dto.getLocation())
                                    .code("AUTO_" + System.currentTimeMillis())

                                    // --- BỔ SUNG QUAN TRỌNG ---
                                    .isDeleted(false) // Fix lỗi Cannot insert NULL into IsDeleted
                                    .dateCreate(LocalDateTime.now()) // Thêm ngày tạo cho chuẩn
                                    // --------------------------

                                    .build()
                    ));

            // 4. Map dữ liệu vào Entity Car
            Car car = new Car();
            car.setMake(brand);
            car.setLocation(location);
            car.setModel(dto.getModel());
            car.setYear(dto.getYear());
            car.setAmount(dto.getAmount());

            // --- XỬ LÝ RANDOM DỮ LIỆU ---
            Random rand = new Random();

            // A. Nhiên liệu
            String[] fuels = {"Xăng", "Dầu", "Điện", "Hybrid"};
            car.setFuel(fuels[rand.nextInt(fuels.length)]);

            // B. Hộp số
            if (dto.getTransmission() == null || dto.getTransmission().isEmpty()) {
                String[] transmissions = {"Tự động", "Số sàn"};
                car.setTransmission(transmissions[rand.nextInt(transmissions.length)]);
            } else {
                car.setTransmission(dto.getTransmission());
            }

            // C. Số chỗ
            if (dto.getSeats() == null || dto.getSeats() == 0) {
                Integer[] seatsOptions = {4, 5, 7};
                car.setSeats(seatsOptions[rand.nextInt(seatsOptions.length)]);
            } else {
                car.setSeats(dto.getSeats());
            }

            // D. Set mặc định IsDeleted cho xe (nếu Entity Car cũng yêu cầu)
            // car.setIsDeleted(false); // Bỏ comment dòng này nếu bảng Cars cũng lỗi tương tự

            // 5. Gán trạng thái và chủ xe
            car.setStatus(CarStatus.PENDING);
            car.setOwner(owner);

            // 6. Xử lý lưu file ảnh
            if (dto.getImages() != null && !dto.getImages().isEmpty()) {
                MultipartFile firstFile = dto.getImages().get(0);
                String fileName = System.currentTimeMillis() + "_" + firstFile.getOriginalFilename();

                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, firstFile.getBytes());

                car.setImageName("/images/cars/" + fileName);
            }

            carRepository.save(car);

            return ResponseEntity.ok("Gửi yêu cầu ký gửi thành công! Vui lòng chờ Admin duyệt.");

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi lưu ảnh: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            // In lỗi chi tiết ra console để dễ debug
            return ResponseEntity.status(400).body("Lỗi xử lý: " + e.getMessage());
        }
    }

    // --- (Các hàm GET bên dưới giữ nguyên) ---

    @GetMapping
    public ResponseEntity<List<CarResponse>> getAllCars(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Double maxPrice
    ) {
        List<Car> cars = carRepository.findAll();

        List<CarResponse> response = cars.stream()
                .filter(car -> car.getStatus() == null || car.getStatus() == CarStatus.AVAILABLE)
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
                .filter(car -> car.getStatus() == CarStatus.AVAILABLE)
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
        List<String> galleryLinks = new ArrayList<>();
        if (car.getImages() != null) {
            galleryLinks = car.getImages().stream()
                    .map(CarImage::getLink)
                    .collect(Collectors.toList());
        }

        String makeName = (car.getMake() != null) ? car.getMake().getName() : "Unknown";
        String locName = (car.getLocation() != null) ? car.getLocation().getName() : "Unknown";

        return CarResponse.builder()
                .id(car.getId())
                .make(makeName)
                .model(car.getModel())
                .year(car.getYear())
                .location(locName)
                .amount(car.getAmount())
                .imageName(car.getImageName())
                .gallery(galleryLinks)
                .seats(car.getSeats())
                .transmission(car.getTransmission())
                .fuel(car.getFuel())
                .build();
    }
}