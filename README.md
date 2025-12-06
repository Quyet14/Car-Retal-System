# 🚗 Car Rental System

Hệ thống quản lý thuê xe được xây dựng bằng Spring Boot (Backend) và HTML/CSS/JavaScript (Frontend).

## 🎯 Tính năng

### Backend (Spring Boot + SQL Server)
- ✅ Đăng ký/Đăng nhập người dùng
- ✅ Xác thực email
- ✅ Quản lý thông tin cá nhân
- ✅ Quản lý xe cho thuê
- ✅ Đặt xe và thanh toán
- ✅ Spring Security
- ✅ RESTful API

### Frontend (HTML/CSS/JavaScript)
- ✅ Giao diện responsive (mobile, tablet, desktop)
- ✅ Trang chủ với hero section
- ✅ Danh sách xe cho thuê
- ✅ Lọc xe theo địa điểm, hãng, giá
- ✅ Chi tiết xe và đặt thuê
- ✅ Form đăng ký/đăng nhập
- ✅ Quản lý session người dùng

## 🛠️ Công nghệ sử dụng

### Backend
- Java 21
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- SQL Server
- MapStruct
- Lombok

### Frontend
- HTML5
- CSS3 (với CSS Variables)
- JavaScript (Vanilla JS)
- Fetch API

### Database
- SQL Server 2022 Express
- Database: Car-Rental-System
- Port: 56860

## 📦 Cài đặt

### Yêu cầu
- JDK 21 trở lên
- SQL Server 2022
- Maven (đã có sẵn mvnw)

### Cấu hình Database

1. **Tạo database:**
```sql
CREATE DATABASE [Car-Rental-System];
```

2. **Cập nhật thông tin kết nối** trong `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:56860;databaseName=Car-Rental-System;encrypt=true;trustServerCertificate=true;
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

## 🚀 Chạy ứng dụng

### Cách 1: Sử dụng Maven Wrapper (Khuyến nghị)
```powershell
# Compile
./mvnw clean compile

# Chạy ứng dụng
./mvnw spring-boot:run
```

### Cách 2: Sử dụng Maven
```powershell
mvn clean compile
mvn spring-boot:run
```

## 🌐 Truy cập

Sau khi chạy thành công, truy cập:

- **Frontend:** http://localhost:9090
- **API Health:** http://localhost:9090/health
- **API Info:** http://localhost:9090/api

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Xem thông tin cá nhân
- `PUT /api/auth/profile` - Cập nhật thông tin
- `GET /api/auth/confirm-email` - Xác nhận email
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Health Check
- `GET /health` - Kiểm tra trạng thái server

## 📁 Cấu trúc thư mục

```
Car-Rental-System/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/carrental/
│   │   │       ├── CarRentalSystemApplication.java
│   │   │       └── config/
│   │   │           ├── controllers/
│   │   │           │   ├── AuthController.java
│   │   │           │   └── HomeController.java
│   │   │           ├── core/
│   │   │           │   ├── dtos/
│   │   │           │   ├── entities/
│   │   │           │   ├── repositories/
│   │   │           │   ├── services/
│   │   │           │   ├── shared/
│   │   │           │   └── validation/
│   │   │           ├── mappers/
│   │   │           └── SecurityConfig.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── index.html
│   │       │   ├── styles.css
│   │       │   └── app.js
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## 🔧 Cấu hình

### Application Properties
```properties
# Server
server.port=9090

# Database
spring.datasource.url=jdbc:sqlserver://localhost:56860;databaseName=Car-Rental-System
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true

# Mail (for development)
spring.mail.host=localhost
spring.mail.port=1025
```

## 🎨 Giao diện

### Trang chủ
- Hero section với gradient background
- Thanh tìm kiếm xe
- Danh sách xe cho thuê với card design
- Giới thiệu dịch vụ
- Form liên hệ

### Tính năng Frontend
- Responsive design
- Smooth animations
- Modal dialogs
- Alert notifications
- Form validation
- Session management với localStorage

## 🐛 Troubleshooting

### Lỗi kết nối database
```
Kiểm tra:
1. SQL Server đang chạy
2. Port 56860 đúng
3. Username/Password đúng
4. Database đã được tạo
```

### Lỗi compile
```powershell
# Xóa cache và compile lại
./mvnw clean compile
```

### Port 9090 đã được sử dụng
```properties
# Đổi port trong application.properties
server.port=8080
```

## 📝 License

MIT License

## 👥 Contributors

- Your Name

## 📞 Liên hệ

- Email: contact@carrental.vn
- Website: http://localhost:9090
