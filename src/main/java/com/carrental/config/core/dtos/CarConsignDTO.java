package com.carrental.config.core.dtos;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data // Tự động sinh Getter, Setter, ToString...
public class CarConsignDTO {
    private String make;
    private String model;
    private Integer year;
    private Integer seats;
    private String transmission;
    private Double amount;
    private String location;
    private String address;

    // SỬA QUAN TRỌNG: Đổi thành String để khớp với ApplicationUser.id
    private String ownerId;

    private List<MultipartFile> images;
}