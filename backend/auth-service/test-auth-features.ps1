# Test script for Auth Service - Rate Limiting & Refresh Tokens
$baseUrl = "http://localhost:3001"
Write-Host ""
Write-Host "=== AUTH SERVICE TEST SUITE ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register a test user
Write-Host "[1/6] Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser_$(Get-Random)@example.com"
    password = "SecurePass123!"
    name = "Test User"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
Write-Host "User registered: $($registerResponse.email)" -ForegroundColor Green
$testEmail = $registerResponse.email

# Test 2: Login and get tokens
Write-Host ""
Write-Host "[2/6] Testing Login (get access + refresh tokens)..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "SecurePass123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Login successful!" -ForegroundColor Green
Write-Host "  - Access Token: $($loginResponse.accessToken.Substring(0,50))..." -ForegroundColor Gray
Write-Host "  - Refresh Token: $($loginResponse.refreshToken)" -ForegroundColor Gray
Write-Host "  - Expires In: $($loginResponse.expiresIn) seconds" -ForegroundColor Gray

$refreshToken = $loginResponse.refreshToken
$accessToken = $loginResponse.accessToken

# Test 3: Rate Limiting
Write-Host ""
Write-Host "[3/6] Testing Rate Limiting (sending 15 rapid requests)..." -ForegroundColor Yellow
$rateLimitErrors = 0
for ($i = 1; $i -le 15; $i++) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop | Out-Null
        Write-Host "  Request $i : OK" -ForegroundColor Gray
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $rateLimitErrors++
            Write-Host "  Request $i : RATE LIMITED (429)" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 100
}
if ($rateLimitErrors -gt 0) {
    Write-Host "Rate limiting working! Blocked $rateLimitErrors requests" -ForegroundColor Green
} else {
    Write-Host "Rate limiting may not be triggered (default is 30/min)" -ForegroundColor Yellow
}

# Test 4: Refresh Token
Write-Host ""
Write-Host "[4/6] Testing Refresh Token..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
Write-Host "Tokens refreshed successfully!" -ForegroundColor Green
Write-Host "  - New Access Token: $($refreshResponse.accessToken.Substring(0,50))..." -ForegroundColor Gray
Write-Host "  - New Refresh Token: $($refreshResponse.refreshToken)" -ForegroundColor Gray

$newRefreshToken = $refreshResponse.refreshToken
$newAccessToken = $refreshResponse.accessToken

# Test 5: Verify old refresh token is revoked
Write-Host ""
Write-Host "[5/6] Testing old refresh token is revoked..." -ForegroundColor Yellow
try {
    $oldRefreshBody = @{ refreshToken = $refreshToken } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method Post -Body $oldRefreshBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "FAILED: Old token still works (should be revoked)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Old refresh token correctly revoked!" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Logout
Write-Host ""
Write-Host "[6/6] Testing Logout..." -ForegroundColor Yellow
$logoutBody = @{
    refreshToken = $newRefreshToken
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $newAccessToken"
}

$logoutResponse = Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method Post -Body $logoutBody -ContentType "application/json" -Headers $headers
Write-Host "Logout successful: $($logoutResponse.message)" -ForegroundColor Green

# Verify logged out token doesn't work
Write-Host "  Verifying logged out token is invalid..." -ForegroundColor Gray
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method Post -Body $logoutBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "  FAILED: Token still works after logout" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  Token correctly invalidated after logout" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== ALL TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
