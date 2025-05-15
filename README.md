# Ollama8Web

A modern web interface for interacting with Ollama models through your browser.

## Prerequisites

⚠️ **Important: This application requires Ollama to be installed and running on your machine** ⚠️

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Start Ollama by running:
```bash
ollama serve
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ollama8web.git
cd ollama8web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How it Works

This application provides a web interface for Ollama, which must be running on your local machine. Here's what you need to know:

- All AI processing happens on your local machine using your own resources
- No data is sent to external servers
- The web interface connects to your local Ollama instance at `http://localhost:11434`
- You need to have models pulled in Ollama to use them (e.g., `ollama pull llama2`)

## Security

- This application only connects to your local Ollama instance
- No external API calls or data collection
- All processing happens on your machine
- No sensitive data is stored or transmitted

## Features

- Clean, modern chat interface
- Support for multiple Ollama models
- Real-time responses
- Dark mode support
- Mobile-responsive design

## Usage

1. Select your desired model from the dropdown menu
2. Type your message in the input field
3. Press Enter or click the Send button
4. Wait for the model's response

## API Endpoints

The application exposes the following API endpoint:

- `POST /api/chat` - Send a message to the Ollama model
  - Request body:
    ```json
    {
      "model": "llama2",
      "messages": [
        {
          "role": "user",
          "content": "Your message here"
        }
      ]
    }
    ```

## Contributing

Feel free to open issues and pull requests! 