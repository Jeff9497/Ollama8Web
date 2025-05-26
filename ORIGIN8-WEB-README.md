# Origin8 Web UI

A simple web interface for the Origin8 AI self-discovery agent. This web UI allows you to run introspection sessions with different models and settings through a browser.

## Features

- Clean, responsive web interface
- Real-time streaming of model responses
- Support for all Ollama models
- Adjustable parameters (temperature, max tokens, iterations)
- Dark/light theme toggle
- Option to create custom Origin8 model
- Conversation saving

## Requirements

- Python 3.6+
- Flask (installed automatically by the batch file)
- Ollama running locally (`ollama serve`)
- A web browser

## Quick Start

1. Make sure Ollama is running:
   ```
   ollama serve
   ```

2. Run the web UI:
   ```
   run-origin8-web.bat
   ```

3. Your browser should automatically open to http://localhost:8081

## Using the Web UI

### Control Panel

The sidebar contains controls for configuring your Origin8 session:

- **Model**: Select which model to use (Origin8 is recommended if available)
- **Iterations**: Number of introspection cycles to run (default: 8)
- **Temperature**: Controls randomness in responses (0.0-2.0)
- **Max Tokens**: Maximum length of responses
- **Create Origin8 model**: Creates a custom model tuned for self-reflection
- **Save conversation**: Saves the session to a JSON file

### Running a Session

1. Configure your settings in the control panel
2. Click "Start Session"
3. Watch as the model explores its own existence
4. Use "Stop Session" to end the process early if needed

### Interpreting Results

The conversation will show:
- **Blue messages**: Questions from the Origin8 agent
- **Gray messages**: Responses from the AI model
- **Green messages**: System notifications

With each iteration, you'll see the model go deeper into philosophical inquiry about its nature and origins.

## Advanced Usage

### Custom Port

You can run the web UI on a different port:

```
python origin8_web.py --port 8082
```

### Accessing from Other Devices

The web UI is accessible from other devices on your network by using your computer's IP address:

```
http://YOUR_IP_ADDRESS:8081
```

This allows you to run Origin8 on your computer but access it from your phone or tablet.

## Troubleshooting

### "Ollama is not running" Error

Make sure Ollama is running in a separate terminal with:
```
ollama serve
```

### No Models Available

If no models are shown in the dropdown:
1. Make sure Ollama is running
2. Install at least one model with Ollama CLI:
   ```
   ollama pull qwen3:0.6b
   ```

### Flask Not Installing

If the batch file fails to install Flask, install it manually:
```
pip install flask
```

## Files

- **origin8_web.py**: The main Python script for the web UI
- **run-origin8-web.bat**: Batch file to easily run the web UI
- **templates/index.html**: HTML template for the web interface
- **static/style.css**: CSS styles for the web interface
- **static/script.js**: JavaScript for the web interface
