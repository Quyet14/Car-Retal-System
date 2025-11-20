# Script để set JAVA_HOME cho JDK 25
# Chạy script này sau khi cài JDK 25

# Tìm JDK 25 (điều chỉnh đường dẫn nếu cần)
$jdkPath = "C:\Program Files\Java\jdk-25"

# Kiểm tra xem JDK có tồn tại không
if (Test-Path $jdkPath) {
    Write-Host "Found JDK at: $jdkPath" -ForegroundColor Green
    
    # Set cho session hiện tại
    $env:JAVA_HOME = $jdkPath
    $env:PATH = "$jdkPath\bin;$env:PATH"
    
    Write-Host "`nJAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
    Write-Host "`nTesting Java installation..." -ForegroundColor Yellow
    
    # Test
    java -version
    javac -version
    
    Write-Host "`n✅ JDK 25 is ready!" -ForegroundColor Green
    Write-Host "`nBây giờ bạn có thể chạy: ./mvnw clean compile" -ForegroundColor Cyan
    
    # Hướng dẫn set vĩnh viễn
    Write-Host "`n⚠️  Lưu ý: Để set JAVA_HOME vĩnh viễn:" -ForegroundColor Yellow
    Write-Host "1. Mở System Properties > Environment Variables" -ForegroundColor White
    Write-Host "2. Thêm biến JAVA_HOME = $jdkPath" -ForegroundColor White
    Write-Host "3. Thêm %JAVA_HOME%\bin vào đầu biến PATH" -ForegroundColor White
    
} else {
    Write-Host "❌ Không tìm thấy JDK tại: $jdkPath" -ForegroundColor Red
    Write-Host "`nVui lòng:" -ForegroundColor Yellow
    Write-Host "1. Tải JDK 25 từ: https://jdk.java.net/25/" -ForegroundColor White
    Write-Host "2. Cài đặt vào C:\Program Files\Java\jdk-25" -ForegroundColor White
    Write-Host "3. Hoặc sửa biến `$jdkPath trong script này" -ForegroundColor White
    
    # Tìm các thư mục Java khác
    Write-Host "`nCác thư mục Java hiện có:" -ForegroundColor Cyan
    Get-ChildItem "C:\Program Files\Java" -Directory -ErrorAction SilentlyContinue | Select-Object Name
}
