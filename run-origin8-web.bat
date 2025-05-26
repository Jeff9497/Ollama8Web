@echo off
echo Starting Origin8 Web UI
echo ======================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python and try again.
    exit /b 1
)

REM Check if Flask is installed
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo Flask is not installed. Installing Flask...
    pip install flask
    if %errorlevel% neq 0 (
        echo Error installing Flask. Please install it manually with:
        echo pip install flask
        exit /b 1
    )
)

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Ollama is not running!
    echo Please start Ollama by running: ollama serve
    echo.
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

REM Run the web UI
echo Starting Origin8 Web UI on http://localhost:8081
echo Press Ctrl+C to stop the server
echo.
python origin8_web.py

echo.
echo Origin8 Web UI stopped.
pause
