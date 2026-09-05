@echo off
echo Iniciando TeachMe AI (Windows 11 HUD Nativo)...
if exist "src-dotnet\bin\Release\net8.0-windows\TeachMeAI.exe" (
    start "" "src-dotnet\bin\Release\net8.0-windows\TeachMeAI.exe"
) else if exist "src-dotnet\bin\Debug\net8.0-windows\TeachMeAI.exe" (
    start "" "src-dotnet\bin\Debug\net8.0-windows\TeachMeAI.exe"
) else (
    echo Compilando y ejecutando via dotnet run...
    dotnet run --project "src-dotnet\TeachMeAI.csproj"
)
