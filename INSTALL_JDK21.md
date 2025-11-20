# Hướng dẫn cài đặt JDK 21 LTS

## Vấn đề hiện tại
- JDK 25 quá mới, Maven compiler plugin chưa hỗ trợ đầy đủ
- JDK 22 trong máy bạn thiếu file thực thi
- Cần JDK 21 LTS (Long Term Support) - ổn định và được hỗ trợ tốt

## Tải JDK 21

**Tùy chọn 1: Oracle JDK 21 (Khuyến nghị)**
- Link: https://www.oracle.com/java/technologies/downloads/#java21
- Chọn: Windows x64 Installer

**Tùy chọn 2: Eclipse Temurin (OpenJDK)**
- Link: https://adoptium.net/temurin/releases/?version=21
- Chọn: Windows x64 .msi installer

## Sau khi cài đặt

1. **Kiểm tra cài đặt:**
```powershell
java -version
javac -version
```

2. **Set JAVA_HOME (tạm thời):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

3. **Set JAVA_HOME (vĩnh viễn):**
- Mở: System Properties > Environment Variables
- Tạo biến mới: JAVA_HOME = C:\Program Files\Java\jdk-21
- Thêm vào PATH: %JAVA_HOME%\bin

4. **Compile project:**
```powershell
./mvnw clean compile
```

5. **Chạy ứng dụng:**
```powershell
./mvnw spring-boot:run
```

## Endpoints API sau khi chạy

- POST http://localhost:8080/api/auth/register - Đăng ký
- POST http://localhost:8080/api/auth/login - Đăng nhập
- GET http://localhost:8080/api/auth/confirm-email - Xác nhận email
- POST http://localhost:8080/api/auth/forgot-password - Quên mật khẩu
- POST http://localhost:8080/api/auth/reset-password - Đặt lại mật khẩu
- GET http://localhost:8080/api/auth/profile - Xem profile
- PUT http://localhost:8080/api/auth/profile - Cập nhật profile
- GET http://localhost:8080/api/auth/logout - Đăng xuất
- GET http://localhost:8080/h2-console - H2 Database Console

## Cấu hình hiện tại

- Spring Boot: 3.2.0
- Java: 21 (sẽ dùng 25 khi Maven hỗ trợ)
- Database: H2 (in-memory)
- Security: Spring Security
- ORM: JPA/Hibernate
