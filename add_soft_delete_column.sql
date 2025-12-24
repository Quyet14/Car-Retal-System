-- Thêm cột IsDeleted vào bảng Cars
ALTER TABLE Cars
ADD IsDeleted BIT NOT NULL DEFAULT 0;

-- Tạo index để tăng tốc query
CREATE INDEX IX_Cars_IsDeleted ON Cars(IsDeleted);

-- Cập nhật tất cả xe hiện tại là chưa xóa
UPDATE Cars SET IsDeleted = 0 WHERE IsDeleted IS NULL;
