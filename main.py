import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os
import webbrowser
import tempfile
from http import HTTPStatus
from urllib.parse import urlparse, parse_qs
from email.message import EmailMessage
from email import message_from_bytes
import logging

# Configure logging with less verbosity
logging.basicConfig(
    level=logging.WARNING,
    format='%(levelname)s:%(message)s'
)
logger = logging.getLogger(__name__)

# Import voice manager (will handle gracefully if not available)
try:
    from voice_manager import voice_manager
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    logger.warning("Voice features not available. Install with: pip install -r voice_requirements.txt")

# Configuration
PORT = 8080
OLLAMA_API = "http://localhost:11434/api"

class OllamaUIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Redirect root path to the ollama8web/index.html
        if self.path == '/':
            self.send_response(HTTPStatus.MOVED_PERMANENTLY)
            self.send_header('Location', '/ollama8web/index.html')
            self.end_headers()
            return

        # Handle voice API requests
        if self.path.startswith('/api/voice/'):
            self.handle_voice_api('GET')
            return

        # Handle API proxy requests
        if self.path.startswith('/api/'):
            self.proxy_request('GET')
            return

        # Default behavior - serve files
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        # Handle voice API requests
        if self.path.startswith('/api/voice/'):
            self.handle_voice_api('POST')
            return

        # Handle TTS API requests
        if self.path.startswith('/api/tts'):
            self.handle_tts_api()
            return

        # Handle API proxy requests
        if self.path.startswith('/api/'):
            self.proxy_request('POST')
            return

        # Default behavior for POST
        self.send_response(HTTPStatus.METHOD_NOT_ALLOWED)
        self.end_headers()

    def proxy_request(self, method):
        # Extract the API endpoint from the path
        api_endpoint = self.path[4:]  # Remove '/api' prefix
        target_url = f"{OLLAMA_API}{api_endpoint}"

        # Get request body for POST requests
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        try:
            # Create the request to Ollama API
            req = urllib.request.Request(
                url=target_url,
                data=body,
                method=method
            )

            # Copy headers from the original request
            for header_name, header_value in self.headers.items():
                if header_name.lower() not in ('host', 'content-length'):
                    req.add_header(header_name, header_value)

            # Make the request to Ollama API
            with urllib.request.urlopen(req) as response:
                # Send the response status code
                self.send_response(response.status)

                # Send headers
                for header_name, header_value in response.getheaders():
                    if header_name.lower() not in ('transfer-encoding', 'connection'):
                        self.send_header(header_name, header_value)

                # Add CORS headers
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')

                self.end_headers()

                # Send the response body
                self.wfile.write(response.read())

        except urllib.error.URLError as e:
            self.send_error(
                HTTPStatus.BAD_GATEWAY,
                f"Error connecting to Ollama API: {str(e)}"
            )

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
        self.end_headers()

    def send_json_response(self, data, status_code=HTTPStatus.OK):
        """Send a JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        response_data = json.dumps(data).encode('utf-8')
        self.wfile.write(response_data)

    def handle_voice_api(self, method):
        """Handle voice-related API requests"""
        if not VOICE_AVAILABLE:
            self.send_error(HTTPStatus.SERVICE_UNAVAILABLE, "Voice features not available")
            return

        # Get voice status
        if self.path == '/api/voice/status' and method == 'GET':
            status = voice_manager.get_voice_status()
            self.send_json_response(status)
            return

        # Update voice settings
        if self.path == '/api/voice/settings' and method == 'POST':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                settings = json.loads(post_data.decode('utf-8'))
                if 'auto_play' in settings:
                    voice_manager.set_auto_play(settings['auto_play'])
                self.send_json_response({"status": "success"})
            except Exception as e:
                self.send_error(HTTPStatus.BAD_REQUEST, str(e))
            return

        # Upload voice sample
        if self.path == '/api/voice/upload' and method == 'POST':
            try:
                # Parse multipart form data
                content_type = self.headers['content-type']
                if not content_type.startswith('multipart/form-data'):
                    raise ValueError("Expected multipart/form-data")

                # Read the form data
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)

                # Create a temporary file to store the audio
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    temp_file.write(post_data)
                    temp_path = temp_file.name

                # Save the voice sample
                result = voice_manager.save_voice_sample(post_data)
                
                # Clean up
                os.unlink(temp_path)
                
                self.send_json_response(result)
                
            except Exception as e:
                self.send_error(HTTPStatus.BAD_REQUEST, str(e))
            return

    def handle_tts_api(self):
        """Handle text-to-speech API requests"""
        if not VOICE_AVAILABLE:
            self.send_json_response({
                "error": "TTS not available",
                "message": "Install voice dependencies with: pip install -r voice_requirements.txt"
            }, HTTPStatus.SERVICE_UNAVAILABLE)
            return

        try:
            # Get request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_json_response({
                    "error": "No data provided"
                }, HTTPStatus.BAD_REQUEST)
                return

            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            text = data.get('text', '').strip()
            voice_id = data.get('voice_id')

            if not text:
                self.send_json_response({
                    "error": "No text provided"
                }, HTTPStatus.BAD_REQUEST)
                return

            # Generate TTS
            audio_base64 = voice_manager.text_to_speech(text, voice_id)

            if audio_base64:
                self.send_json_response({
                    "audio": audio_base64,
                    "format": "wav"
                })
            else:
                self.send_json_response({
                    "error": "TTS generation failed"
                }, HTTPStatus.INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(f"TTS error: {e}")
            self.send_json_response({
                "error": "TTS generation failed",
                "message": str(e)
            }, HTTPStatus.INTERNAL_SERVER_ERROR)

def create_index_html():
    """Create a simple index.html file if it doesn't exist"""
    if not os.path.exists('index.html'):
        with open('index.html', 'w') as f:
            f.write('''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama Web UI</title>
    <style>
        :root {
            --primary-color: #3498db;
            --primary-dark: #2980b9;
            --secondary-color: #2ecc71;
            --secondary-dark: #27ae60;
            --text-color: #333;
            --text-light: #666;
            --bg-color: #f5f5f5;
            --card-bg: #fff;
            --border-color: #ddd;
            --shadow-color: rgba(0, 0, 0, 0.1);
            --chat-user-bg: #e1f5fe;
            --chat-ai-bg: #f1f1f1;
            --thinking-bg: #f8f9fa;
            --thinking-border: #e9ecef;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            height: 95vh;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
        }

        .main-content {
            display: flex;
            flex: 1;
            gap: 20px;
        }

        .sidebar {
            width: 300px;
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .chat-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .models-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .model-item {
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            cursor: pointer;
        }

        .model-item:hover {
            background-color: rgba(52, 152, 219, 0.1);
        }

        .model-item.selected {
            background-color: var(--primary-color);
            color: white;
        }

        .chat-container {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .user-message {
            background-color: var(--chat-user-bg);
            align-self: flex-end;
        }

        .ai-message {
            background-color: var(--chat-ai-bg);
            align-self: flex-start;
        }

        .thinking-container {
            margin-top: 5px;
            border: 1px solid var(--thinking-border);
            border-radius: 4px;
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.3s ease-out;
        }

        .thinking-container.expanded {
            max-height: 500px;
            overflow-y: auto;
        }

        .thinking-content {
            background-color: var(--thinking-bg);
            padding: 10px;
            font-family: monospace;
            white-space: pre-wrap;
            font-size: 0.9em;
            color: var(--text-light);
        }

        .thinking-toggle {
            display: none;
            font-size: 0.8em;
            color: var(--text-light);
            cursor: pointer;
            margin-top: 5px;
            user-select: none;
        }

        .thinking-toggle.visible {
            display: block;
        }

        .chat-input-container {
            display: flex;
            padding: 10px;
            border-top: 1px solid var(--border-color);
        }

        #chat-input {
            flex: 1;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-right: 10px;
            resize: none;
            height: 20px;
            max-height: 150px;
            transition: height 0.2s;
        }

        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 15px;
            cursor: pointer;
        }

        button:hover {
            background-color: var(--primary-dark);
        }

        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }

        .parameter-controls {
            margin-top: 15px;
        }

        .parameter-group {
            margin-bottom: 10px;
        }

        .parameter-group label {
            display: block;
            margin-bottom: 5px;
        }

        .parameter-slider {
            display: flex;
            align-items: center;
        }

        .parameter-slider input {
            flex: 1;
            margin: 0 10px;
        }

        .loading {
            color: #666;
            font-style: italic;
        }

        .dark-theme {
            --text-color: #f5f5f5;
            --text-light: #aaa;
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --border-color: #333;
            --shadow-color: rgba(0, 0, 0, 0.3);
            --chat-user-bg: #1a3a4a;
            --chat-ai-bg: #2a2a2a;
            --thinking-bg: #252525;
            --thinking-border: #333;
        }

        @media (max-width: 768px) {
            .main-content {
                flex-direction: column;
            }

            .sidebar {
                width: 100%;
                max-height: 300px;
                overflow-y: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div></div>
            <div class="header-title">
                <h1>Ollama Web UI</h1>
            </div>
            <button id="theme-toggle" class="theme-toggle">🌙</button>
        </header>

        <div class="main-content">
            <div class="sidebar">
                <div>
                    <h2>Models</h2>
                    <div id="models-list" class="models-list">
                        <div class="loading">Loading models...</div>
                    </div>
                </div>

                <div class="parameter-controls">
                    <h2>Parameters</h2>
                    <div class="parameter-group">
                        <label for="temperature">Temperature: <span id="temp-value">0.7</span></label>
                        <div class="parameter-slider">
                            <span>0</span>
                            <input type="range" id="temperature" min="0" max="2" step="0.1" value="0.7">
                            <span>2</span>
                        </div>
                    </div>
                    <div class="parameter-group">
                        <label for="max-tokens">Max Tokens: <span id="tokens-value">2048</span></label>
                        <div class="parameter-slider">
                            <span>256</span>
                            <input type="range" id="max-tokens" min="256" max="4096" step="256" value="2048">
                            <span>4096</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chat-section">
                <div id="chat-container" class="chat-container">
                    <div class="ai-message">Select a model from the sidebar to start chatting.</div>
                </div>

                <div class="chat-input-container">
                    <textarea id="chat-input" placeholder="Type your message here..." disabled></textarea>
                    <button id="send-btn" disabled>Send</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // DOM Elements
        const modelsList = document.getElementById('models-list');
        const chatContainer = document.getElementById('chat-container');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const temperatureSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temp-value');
        const maxTokensSlider = document.getElementById('max-tokens');
        const tokensValue = document.getElementById('tokens-value');
        const themeToggle = document.getElementById('theme-toggle');

        // State
        let currentModel = null;
        let isDarkTheme = false;

        // Initialize
        document.addEventListener('DOMContentLoaded', init);

        async function init() {
            await loadModels();
            setupEventListeners();
            checkThemePreference();
            adjustTextareaHeight();
        }

        // Load models from Ollama API
        async function loadModels() {
            try {
                const response = await fetch('/api/tags');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                displayModels(data.models);
            } catch (error) {
                console.error('Error loading models:', error);
                modelsList.innerHTML = `<div>Error: ${error.message}</div>`;
                modelsList.innerHTML += '<div>Make sure Ollama is running!</div>';
            }
        }

        // Display models in the sidebar
        function displayModels(models) {
            if (!models || models.length === 0) {
                modelsList.innerHTML = '<div>No models found</div>';
                return;
            }

            modelsList.innerHTML = '';
            models.forEach(model => {
                const modelItem = document.createElement('div');
                modelItem.className = 'model-item';
                modelItem.textContent = model.name;
                modelItem.addEventListener('click', () => selectModel(model.name));
                modelsList.appendChild(modelItem);
            });
        }

        // Select a model
        function selectModel(modelName) {
            // Update UI
            document.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('selected');
            });

            document.querySelectorAll('.model-item').forEach(item => {
                if (item.textContent === modelName) {
                    item.classList.add('selected');
                }
            });

            currentModel = modelName;

            // Enable chat
            chatInput.disabled = false;
            sendBtn.disabled = false;

            // Clear chat
            chatContainer.innerHTML = '';
            addAIMessage(`I'm ${modelName}, how can I help you today?`);
        }

        // Send message
        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message || !currentModel) return;

            // Add user message
            addUserMessage(message);
            chatInput.value = '';
            adjustTextareaHeight();

            // Get parameters
            const temperature = parseFloat(temperatureSlider.value);
            const maxTokens = parseInt(maxTokensSlider.value);

            try {
                // Add loading message
                const loadingMsg = document.createElement('div');
                loadingMsg.className = 'message ai-message loading';
                loadingMsg.textContent = 'Thinking...';
                chatContainer.appendChild(loadingMsg);

                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: currentModel,
                        prompt: message,
                        stream: false,
                        options: {
                            temperature: temperature,
                            num_predict: maxTokens
                        }
                    })
                });

                // Remove loading message
                chatContainer.removeChild(loadingMsg);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                processAIResponse(data.response);
            } catch (error) {
                console.error('Error:', error);
                addAIMessage(`Error: ${error.message}`);
            }
        }

        // Add user message to chat
        function addUserMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.textContent = message;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Process AI response to extract thinking part
        function processAIResponse(response) {
            // Check if response contains thinking tags
            // Use a more robust regex that handles the tags properly
            const thinkingRegex = /<think>([\s\S]*?)<\/think>/;
            const thinkingMatch = response.match(thinkingRegex);

            if (thinkingMatch) {
                // Extract thinking and actual response
                const thinking = thinkingMatch[1].trim();
                // Remove the thinking part from the response
                const actualResponse = response.replace(thinkingRegex, '').trim();

                console.log("Found thinking:", thinking);
                console.log("Actual response:", actualResponse);

                // Add message with thinking toggle
                addAIMessageWithThinking(actualResponse, thinking);
            } else {
                // Regular message without thinking
                addAIMessage(response);
            }
        }

        // Add AI message to chat
        function addAIMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            messageDiv.textContent = message;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Add AI message with collapsible thinking section
        function addAIMessageWithThinking(message, thinking) {
            // Create message container
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';

            // Create message text node
            const messageText = document.createTextNode(message);
            messageDiv.appendChild(messageText);

            // Create thinking toggle
            const thinkingToggle = document.createElement('div');
            thinkingToggle.className = 'thinking-toggle visible';
            thinkingToggle.textContent = '▶ Show thinking';

            // Create thinking container
            const thinkingContainer = document.createElement('div');
            thinkingContainer.className = 'thinking-container';

            // Create thinking content
            const thinkingContent = document.createElement('div');
            thinkingContent.className = 'thinking-content';
            thinkingContent.textContent = thinking;

            // Add thinking content to container
            thinkingContainer.appendChild(thinkingContent);

            // Add toggle functionality
            thinkingToggle.addEventListener('click', () => {
                thinkingContainer.classList.toggle('expanded');
                thinkingToggle.textContent = thinkingContainer.classList.contains('expanded')
                    ? '▼ Hide thinking'
                    : '▶ Show thinking';
            });

            // Add everything to the message div
            messageDiv.appendChild(document.createElement('br'));
            messageDiv.appendChild(thinkingToggle);
            messageDiv.appendChild(thinkingContainer);

            // Add to chat
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Setup event listeners
        function setupEventListeners() {
            sendBtn.addEventListener('click', sendMessage);

            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            chatInput.addEventListener('input', adjustTextareaHeight);

            temperatureSlider.addEventListener('input', () => {
                tempValue.textContent = temperatureSlider.value;
            });

            maxTokensSlider.addEventListener('input', () => {
                tokensValue.textContent = maxTokensSlider.value;
            });

            themeToggle.addEventListener('click', toggleTheme);
        }

        // Toggle between light and dark theme
        function toggleTheme() {
            isDarkTheme = !isDarkTheme;
            document.body.classList.toggle('dark-theme', isDarkTheme);
            themeToggle.textContent = isDarkTheme ? '☀️' : '🌙';
            localStorage.setItem('darkTheme', isDarkTheme);
        }

        // Check user's theme preference
        function checkThemePreference() {
            const savedTheme = localStorage.getItem('darkTheme');
            if (savedTheme === 'true') {
                isDarkTheme = true;
                document.body.classList.add('dark-theme');
                themeToggle.textContent = '☀️';
            }
        }

        // Adjust textarea height based on content
        function adjustTextareaHeight() {
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
        }
    </script>
</body>
</html>''')

def check_ollama_running():
    """Check if Ollama is running"""
    try:
        with urllib.request.urlopen(f"{OLLAMA_API}/tags") as response:
            return response.status == 200
    except:
        return False

def main():
    # Check if Ollama is running
    if not check_ollama_running():
        logger.error("Ollama is not running! Please start Ollama by running: ollama serve")
        return

    # Check if the UI directory exists
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ui_dir = os.path.join(script_dir, "ollama8web")

    if not os.path.exists(ui_dir):
        logger.error(f"UI directory not found at {ui_dir}")
        return

    # Verify that the index.html file exists in the UI directory
    index_path = os.path.join(ui_dir, "index.html")
    if not os.path.exists(index_path):
        logger.error(f"index.html not found at {index_path}")
        return

    # Start the server
    handler = OllamaUIHandler

    # Set the directory to serve files from
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"\nOllama8Web is running!")
        print(f"→ Open http://localhost:{PORT}/ollama8web/index.html in your browser")
        print("Press Ctrl+C to stop the server\n")

        # Open the browser directly to the correct URL
        webbrowser.open(f"http://localhost:{PORT}/ollama8web/index.html")

        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == "__main__":
    main()
