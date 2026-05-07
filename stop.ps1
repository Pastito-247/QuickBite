# QuickBite - Script de Detencion Simple

Write-Host "Deteniendo QuickBite - Modo Evaluacion Local" -ForegroundColor Red

# Detener procesos Node.js
Write-Host "Deteniendo procesos Node.js..." -ForegroundColor Blue
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "Deteniendo proceso Node.js (PID: $($_.Id))" -ForegroundColor Cyan
        $_.Kill()
    }
} else {
    Write-Host "No se encontraron procesos Node.js corriendo" -ForegroundColor Gray
}

# Detener procesos Java
Write-Host "Deteniendo procesos Java..." -ForegroundColor Blue
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $javaProcesses | ForEach-Object {
        Write-Host "Deteniendo proceso Java (PID: $($_.Id))" -ForegroundColor Cyan
        $_.Kill()
    }
} else {
    Write-Host "No se encontraron procesos Java corriendo" -ForegroundColor Gray
}

# Esperar un momento
Start-Sleep -Seconds 3

# Verificar puertos
$ports = @(3000, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8761)
Write-Host ""
Write-Host "Verificando que los puertos esten liberados..." -ForegroundColor Blue

foreach ($port in $ports) {
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $port)
        $connection.Close()
        Write-Host "ADVERTENCIA: Puerto $port todavia esta en uso" -ForegroundColor Yellow
    } catch {
        Write-Host "Puerto $port esta libre" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "QuickBite ha sido detenido completamente" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar nuevamente:" -ForegroundColor Yellow
Write-Host "   .\start.ps1" -ForegroundColor White
