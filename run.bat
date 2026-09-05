@echo off
echo Iniciando TeachMe AI (Windows 11 HUD Nativo)...
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
