@echo off
echo Testing the Jeff model...
echo.
echo Type your messages and press Enter. Type 'exit' to quit.
echo.

:loop
set /p message="You: "

if "%message%"=="exit" goto :end

echo.
echo Jeff is thinking...
echo.

curl -s -X POST http://localhost:11434/api/generate -d "{\"model\": \"jeff\", \"prompt\": \"%message%\", \"stream\": false}" | findstr /r "response"

echo.
goto :loop

:end
echo Goodbye!
