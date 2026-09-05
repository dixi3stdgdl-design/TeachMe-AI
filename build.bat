@echo off
setlocal
echo =======================================================
echo   TeachMe AI - Compilador Hibrido Rust + .NET 10 (C#)
echo =======================================================
echo.

:: 1. Compilar Crate de Rust si Cargo esta instalado
where cargo >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [1/2] Compilando libreria de bajo nivel en Rust (teachme_core.dll)...
    pushd src-rust
    cargo build --release
    if exist "target\release\teachme_core.dll" (
        copy /y "target\release\teachme_core.dll" "..\src-dotnet\bin\Debug\net8.0-windows\" >nul
        copy /y "target\release\teachme_core.dll" "..\src-dotnet\" >nul
        echo [OK] Rust Kernel compilado con exito.
    )
    popd
) else (
    echo [INFO] Cargo/Rustc no detectado en PATH.
    echo El bridge C# activara el Fast-Path Win32 nativo de alto rendimiento.
)

echo.
echo [2/2] Compilando aplicacion .NET 10 WPF (TeachMe AI HUD)...
dotnet build "src-dotnet\TeachMeAI.csproj" -c Release
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo la compilacion de .NET.
    exit /b 1
)

echo.
echo =======================================================
echo   Compilacion exitosa.
echo   Ejecutable generado en:
echo   src-dotnet\bin\Release\net8.0-windows\TeachMeAI.exe
echo =======================================================
