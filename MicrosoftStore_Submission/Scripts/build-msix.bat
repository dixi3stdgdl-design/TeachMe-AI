@echo off
setlocal
echo ==========================================================
echo   Compilador y Empaquetador Automatico MSIX - TeachMe AI
echo ==========================================================
echo.
echo [1/2] Publicando binarios self-contained win-x64 con dotnet...
dotnet publish "%~dp0..\..\src-dotnet\TeachMeAI.csproj" -c Release -r win-x64 --self-contained true -o "%~dp0..\..\.staging_publish"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo la publicacion de dotnet.
    pause
    exit /b 1
)

echo.
echo [2/2] Generando paquete MSIX oficial con makeappx...
powershell -ExecutionPolicy Bypass -File "%~dp0Actualizar-Identidad-Y-Compilar.ps1"

echo.
pause
