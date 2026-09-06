@echo off
setlocal enabledelayedexpansion

:: Set absolute path to prevent launching/saving in System32
set "ASSETS_DIR=C:\vconvert-assets"

:: Check if folder exists and has items
set "HAS_ITEMS=0"
if exist "%ASSETS_DIR%\" (
    for /f %%A in ('dir /b /a "%ASSETS_DIR%" 2^>nul') do (
        set /a HAS_ITEMS+=1
    )
)

:: If folder doesn't exist or doesn't have 8 items, download and extract
if !HAS_ITEMS! LSS 8 (
    echo [INFO] Setting up %ASSETS_DIR%...
    
    :: Remove incomplete folder if it exists
    if exist "%ASSETS_DIR%" rmdir /s /q "%ASSETS_DIR%"
    
    :: Create temp working directory in user's temp path to avoid permission issues
    mkdir "%TEMP%\vconvert_temp"
    
    echo [INFO] Downloading repository...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/techambient/vConvert/archive/refs/heads/main.zip' -OutFile '%TEMP%\vconvert_temp\main.zip'"
    
    echo [INFO] Extracting files...
    powershell -Command "Expand-Archive -Path '%TEMP%\vconvert_temp\main.zip' -DestinationPath '%TEMP%\vconvert_temp\extracted' -Force"
    
    :: Create target assets directory on C:\
    mkdir "%ASSETS_DIR%"
    
    :: Move contents from the nested vconvert-main folder into C:\vconvert-assets
    xcopy /s /e /y "%TEMP%\vconvert_temp\extracted\vconvert-main\*.*" "%ASSETS_DIR%\" >nul
    
    :: Clean up temp files
    rmdir /s /q "%TEMP%\vconvert_temp"
    echo [INFO] Setup complete.
) else (
    echo [INFO] %ASSETS_DIR% already exists with required items.
)

:: Launch index.html in the default local browser
if exist "%ASSETS_DIR%\index.html" (
    echo [INFO] Launching index.html...
    start "" "%ASSETS_DIR%\index.html"
) else (
    echo [ERROR] index.html not found in %ASSETS_DIR%!
)

endlocal