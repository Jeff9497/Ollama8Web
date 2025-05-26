# Ollama8Web

This is a simple web interface for interacting with your locally installed Ollama models.

## Quick Start

1. Make sure Ollama is running:
   ```
   ollama serve
   ```

2. Run the web UI:
   ```
   start-web-ui.bat
   ```

   Or directly with Python:
   ```
   python main.py
   ```

3. Your browser will automatically open to http://localhost:8080

## Features

- Chat with any of your installed Ollama models
- Adjust temperature and max tokens parameters
- No CORS issues - works reliably with your local Ollama installation
- Simple, lightweight interface

## How It Works

The Python script (`main.py`) creates a local web server that:

1. Serves the web UI (HTML, CSS, JavaScript)
2. Acts as a proxy between your browser and the Ollama API
3. Handles CORS headers automatically

This approach avoids the cross-origin issues that can occur when trying to access the Ollama API directly from a web page.

## Troubleshooting

If you encounter any issues:

1. Make sure Ollama is running (`ollama serve`)
2. Check that port 8080 is available on your system
3. Ensure you have Python installed

## Custom Models

You can use this UI with any of your Ollama models, including custom models like "jeff" that you've created.

To create a new custom model:

1. Create a Modelfile:
   ```
   FROM base_model
   SYSTEM """
   Your system prompt here
   """
   PARAMETER temperature 0.7
   ```

2. Create the model:
   ```
   ollama create mymodel -f Modelfile
   ```

3. Use it in the web UI by selecting it from the models list
