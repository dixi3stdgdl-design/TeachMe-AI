@echo off
echo Preparando TeachMe AI...
taskkill /f /im TeachMeAI.exe >nul 2>&1
timeout /t 1 /nobreak >nul 2>&1
echo Iniciando compilacion y lanzamiento (Windows 11 HUD Nativo)...
dotnet build "src-dotnet\TeachMeAI.csproj" -c Release -v q --nologo
if %ERRORLEVEL% equ 0 (
    start "" "src-dotnet\bin\Release\net8.0-windows\TeachMeAI.exe"
) else (
    if exist "src-dotnet\bin\Release\net8.0-windows\TeachMeAI.exe" (
        start "" "src-dotnet\bin\Release\net8.0-windows\TeachMeAI.exe"
    ) else (
        dotnet run --project "src-dotnet\TeachMeAI.csproj" -c Release
    )
)
