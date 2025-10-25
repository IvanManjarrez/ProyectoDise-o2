# Smoke test for ProyectoDise-o2
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1

$ErrorActionPreference = 'Stop'
 # Force IPv4 address to avoid IPv6 (::1) connection issues
$gateway = 'http://127.0.0.1:3000'

try {
    Write-Host "Waiting 5s for services to initialize..."
    Start-Sleep -Seconds 5

    Write-Host "-> Registering user"
    $registerBody = @{ email = 'smoke@example.com'; password = 'P@ssw0rd123!'; name = 'Smoke Tester' } | ConvertTo-Json
    $reg = Invoke-RestMethod -Method Post -Uri "$gateway/auth/register" -Body $registerBody -ContentType 'application/json'
    Write-Host "Registered:" ($reg | ConvertTo-Json)

    Write-Host "-> Logging in"
    $loginBody = @{ email = 'smoke@example.com'; password = 'P@ssw0rd123!' } | ConvertTo-Json
    $login = Invoke-RestMethod -Method Post -Uri "$gateway/auth/login" -Body $loginBody -ContentType 'application/json'
    Write-Host "Login response:" ($login | ConvertTo-Json)

    if (-not $login.token) { throw "No token returned from login" }
    $token = $login.token
    $user = $login.user

    Write-Host "-> GET /users/me"
    $me = Invoke-RestMethod -Method Get -Uri "$gateway/users/me" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Me response:" ($me | ConvertTo-Json)

    $artworkId = "artwork-smoke-1"
    Write-Host "-> Add favorite"
    $add = Invoke-RestMethod -Method Post -Uri "$gateway/users/$($user.id)/favorites" -Headers @{ Authorization = "Bearer $token" } -Body (@{ artworkId = $artworkId } | ConvertTo-Json) -ContentType 'application/json'
    Write-Host "Add favorite response:" ($add | ConvertTo-Json)

    Write-Host "-> Remove favorite"
    $rem = Invoke-RestMethod -Method Delete -Uri "$gateway/users/$($user.id)/favorites" -Headers @{ Authorization = "Bearer $token" } -Body (@{ artworkId = $artworkId } | ConvertTo-Json) -ContentType 'application/json'
    Write-Host "Remove favorite response:" ($rem | ConvertTo-Json)

    Write-Host "SMOKE TEST: SUCCESS"
    exit 0
}
catch {
    Write-Host "SMOKE TEST: FAILED`nError: $_" -ForegroundColor Red
    exit 1
}
