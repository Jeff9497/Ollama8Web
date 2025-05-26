# Ollama8Web

A simple, lightweight web interface for interacting with your locally installed Ollama models.

## Features

- 🔄 List and select from your installed Ollama models
- 💬 Chat with your models with a clean interface
- ✨ Create custom models with personalized system prompts
- 🎛️ Adjust model parameters (temperature, top_p, top_k, context window)
- 🌓 Dark/light theme toggle
- 💻 Fully local - works offline with your Ollama installation

## Prerequisites

- [Ollama](https://ollama.ai/) installed and running
- [Node.js](https://nodejs.org/) (v14 or later)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/ollama8web.git
   cd ollama8web
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Chatting with Models

1. Select a model from the sidebar
2. Type your message in the input box
3. Press Enter or click Send

### Creating Custom Models

1. Select a base model from the dropdown
2. Enter a name for your new model
3. (Optional) Add a system prompt to customize behavior
4. Adjust parameters as needed
5. Click "Create Model"

## Model Optimization

The interface allows you to adjust several parameters to optimize your models:

- **Temperature**: Controls randomness (0.0-2.0)
- **Top P**: Controls diversity via nucleus sampling (0.0-1.0)
- **Top K**: Limits vocabulary to top K options (1-100)
- **Context Window**: Sets the token context size (512-8192)

## Development

For development with auto-restart:

```
npm run dev
```

## License

MIT

## Acknowledgements

- [Ollama](https://ollama.ai/) for the amazing local LLM runtime
- All the open-source contributors to the LLM ecosystem
