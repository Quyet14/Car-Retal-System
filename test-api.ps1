# Test API endpoints

Write-Host "Testing Health Endpoint..." -ForegroundColor Green
curl http://localhost:9090/health

Write-Host "`n`nTesting Home Endpoint..." -ForegroundColor Green
curl http://localhost:9090/

Write-Host "`n`nTesting Register Endpoint..." -ForegroundColor Green
$registerData = @{
    email = "test@example.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    country = "Vietnam"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"
