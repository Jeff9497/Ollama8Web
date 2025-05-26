@echo off
echo Running Origin8 - AI Self-Discovery Agent
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python and try again.
    exit /b 1
)

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Ollama is not running!
    echo Please start Ollama by running: ollama serve
    exit /b 1
)

echo Choose an option:
echo 1. Create Origin8 model and run (recommended first time)
echo 2. Run with existing Origin8 model
echo 3. Run with Qwen model directly
echo 4. Run with custom settings
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    python origin8.py --create-model --save
) else if "%choice%"=="2" (
    python origin8.py --model origin8 --save
) else if "%choice%"=="3" (
    python origin8.py --model qwen3:0.6b --save
) else if "%choice%"=="4" (
    echo.
    set /p model="Enter model name (default: qwen3:0.6b): "
    set /p iterations="Enter number of iterations (default: 8): "
    
    if "%model%"=="" set model=qwen3:0.6b
    if "%iterations%"=="" set iterations=8
    
    python origin8.py --model %model% --iterations %iterations% --save
) else (
    echo Invalid choice.
    exit /b 1
)

echo.
echo Origin8 process complete.
echo.
pause
