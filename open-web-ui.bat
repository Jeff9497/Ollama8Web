@echo off
echo Ollama8Web Launcher
echo ======================
echo.

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Ollama is not running!
    echo.
    echo Please start Ollama by running:
    echo ollama serve
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo Ollama is running! Opening Ollama8Web...
echo.

REM Open the simple UI in the default browser
start "" "%~dp0ollama8web\simple-ui.html"

echo.
echo If the UI doesn't open automatically, you can open it manually at:
echo file://%~dp0ollama8web\simple-ui.html
echo.
echo Press any key to exit...
pause > nul
