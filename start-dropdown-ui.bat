@echo off
echo Starting Ollama Web UI with Dropdown Menu...
echo.
echo This will start a local web server on port 8080
echo and open your browser to access the Ollama Web UI.
echo.
echo Make sure Ollama is running!
echo.
python serve_dropdown_ui.py
echo.
echo If the browser doesn't open automatically, go to:
echo http://localhost:8080
echo.
pause
