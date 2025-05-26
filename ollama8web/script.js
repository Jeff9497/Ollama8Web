// Constants
const OLLAMA_API_BASE = 'http://localhost:11434/api';
const API_ENDPOINTS = {
    LIST_MODELS: `${OLLAMA_API_BASE}/tags`,
    GENERATE: `${OLLAMA_API_BASE}/generate`,
    CREATE_MODEL: `${OLLAMA_API_BASE}/create`,
    CHAT: `${OLLAMA_API_BASE}/chat`
};

// DOM Elements
const modelsList = document.getElementById('models-list');
const createModelHeader = document.getElementById('create-model-header');
const createModelContent = document.getElementById('create-model-content');
const baseModelSelect = document.getElementById('base-model');
const createModelForm = document.getElementById('create-model-form');
const currentModelSpan = document.getElementById('current-model');
const modelSizeSpan = document.getElementById('model-size');
const modelModifiedSpan = document.getElementById('model-modified');
const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Voice Mode Elements
const voiceModeBtn = document.getElementById('voice-mode-btn');
const voiceModeOverlay = document.getElementById('voice-mode-overlay');
const closeVoiceModeBtn = document.getElementById('close-voice-mode');
const startRecordingBtn = document.getElementById('start-recording');
const stopRecordingBtn = document.getElementById('stop-recording');
const recordingTimer = document.getElementById('recording-timer');
const timerDisplay = document.getElementById('timer-display');
const audioPreview = document.getElementById('audio-preview');
const recordedAudio = document.getElementById('recorded-audio');
const saveVoiceCloneBtn = document.getElementById('save-voice-clone');
const recordAgainBtn = document.getElementById('record-again');
const voiceStatus = document.getElementById('voice-status');
const voiceResponsesEnabled = document.getElementById('voice-responses-enabled');
const voiceInputEnabled = document.getElementById('voice-input-enabled');
const testText = document.getElementById('test-text');
const testVoiceBtn = document.getElementById('test-voice');
const testStatus = document.getElementById('test-status');

// Parameter sliders
const temperatureSlider = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperature-value');
const topPSlider = document.getElementById('top-p');
const topPValue = document.getElementById('top-p-value');
const topKSlider = document.getElementById('top-k');
const topKValue = document.getElementById('top-k-value');
const contextWindowSelect = document.getElementById('context-window');

// State
let currentModel = null;
let chatHistory = [];
let isDarkTheme = false;

// Voice Mode State
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingInterval = null;
let hasVoiceClone = false;
let voiceCloneId = null;

// Initialize the application
async function init() {
    await loadModels();
    setupEventListeners();
    checkThemePreference();
    initializeVoiceMode();

    // Initialize the create model section as collapsed by default
    createModelContent.classList.remove('active');
}

// Toggle collapsible section
function toggleCollapsible(header, content) {
    header.classList.toggle('active');
    content.classList.toggle('active');
}

// Load models from Ollama API
async function loadModels() {
    try {
        const response = await fetch(API_ENDPOINTS.LIST_MODELS);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayModels(data.models);
        populateBaseModelOptions(data.models);
    } catch (error) {
        console.error('Error loading models:', error);
        modelsList.innerHTML = `<div class="error">Error loading models: ${error.message}</div>`;
    }
}

// Display models in the sidebar
function displayModels(models) {
    if (!models || models.length === 0) {
        modelsList.innerHTML = '<div class="no-models">No models found. Please install models using Ollama CLI.</div>';
        return;
    }

    modelsList.innerHTML = '';
    models.forEach(model => {
        const modelItem = document.createElement('div');
        modelItem.className = 'model-item';
        modelItem.dataset.name = model.name;
        modelItem.dataset.size = formatSize(model.size);
        modelItem.dataset.modified = formatDate(model.modified_at);

        modelItem.innerHTML = `
            <div class="model-name">${model.name}</div>
            <div class="model-details">
                <span class="model-size">${formatSize(model.size)}</span>
                <span class="model-date">${formatDate(model.modified_at)}</span>
            </div>
        `;

        modelItem.addEventListener('click', () => selectModel(model));
        modelsList.appendChild(modelItem);
    });
}

// Populate base model options for creating custom models
function populateBaseModelOptions(models) {
    baseModelSelect.innerHTML = '';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        baseModelSelect.appendChild(option);
    });
}

// Select a model for chat
function selectModel(model) {
    // Update UI
    document.querySelectorAll('.model-item').forEach(item => {
        item.classList.remove('selected');
    });

    const selectedItem = document.querySelector(`.model-item[data-name="${model.name}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }

    currentModel = model.name;
    currentModelSpan.textContent = model.name;
    modelSizeSpan.textContent = formatSize(model.size);
    modelModifiedSpan.textContent = formatDate(model.modified_at);

    // Enable chat
    sendBtn.disabled = false;
    chatInput.disabled = false;

    // Clear chat history
    chatHistory = [];
    chatContainer.innerHTML = '';

    // Add welcome message with enhanced styling
    addWelcomeMessage(`✨ I'm ${model.name} 🧠 - Ready to assist you today! How can I help? ✨`);
}

// Create a custom model
async function createCustomModel(event) {
    event.preventDefault();

    const baseModel = baseModelSelect.value;
    const modelName = document.getElementById('model-name').value;
    const systemPrompt = document.getElementById('system-prompt').value;
    const temperature = temperatureSlider.value;
    const topP = topPSlider.value;
    const topK = topKSlider.value;
    const contextWindow = contextWindowSelect.value;

    // Create Modelfile content
    let modelfileContent = `FROM ${baseModel}\n\n`;

    if (systemPrompt) {
        modelfileContent += `SYSTEM """\n${systemPrompt}\n"""\n\n`;
    }

    modelfileContent += `PARAMETER temperature ${temperature}\n`;
    modelfileContent += `PARAMETER top_p ${topP}\n`;
    modelfileContent += `PARAMETER top_k ${topK}\n`;
    modelfileContent += `PARAMETER num_ctx ${contextWindow}\n`;

    try {
        const createResponse = await fetch(API_ENDPOINTS.CREATE_MODEL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: modelName,
                modelfile: modelfileContent
            })
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.error || `HTTP error! Status: ${createResponse.status}`);
        }

        alert(`Model "${modelName}" created successfully!`);
        await loadModels(); // Refresh models list
    } catch (error) {
        console.error('Error creating model:', error);
        alert(`Error creating model: ${error.message}`);
    }
}

// Send a message to the AI
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || !currentModel) return;

    // Add user message to chat
    addUserMessage(message);
    chatInput.value = '';

    // Prepare request
    const temperature = parseFloat(temperatureSlider.value);
    const topP = parseFloat(topPSlider.value);
    const topK = parseInt(topKSlider.value);

    try {
        // Add loading indicator
        const loadingId = addLoadingMessage();

        const response = await fetch(API_ENDPOINTS.GENERATE, {
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
                    top_p: topP,
                    top_k: topK
                }
            })
        });

        // Remove loading indicator
        removeLoadingMessage(loadingId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        addAIMessageWithVoice(data.response);

        // Update chat history
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: data.response });
    } catch (error) {
        console.error('Error sending message:', error);
        addErrorMessage(`Error: ${error.message}`);
    }
}

// Add a user message to the chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Add an AI message to the chat
function addAIMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Add a welcome message with special styling
function addWelcomeMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message welcome-intro';
    messageDiv.innerHTML = `
        <div class="message-text">${message}</div>
        <div class="audio-controls" style="margin-top: 10px; display: none;">
            <button class="play-audio-btn" onclick="playMessageAudio(this, '${message.replace(/'/g, "\\'")}')">
                🔊 Play Audio
            </button>
            <audio class="message-audio" controls style="display: none; width: 100%; margin-top: 5px;"></audio>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Generate audio if voice responses are enabled
    if (voiceResponsesEnabled && voiceResponsesEnabled.checked && hasVoiceClone) {
        generateAudioForMessage(message, messageDiv);
    }
}

// Add a loading message
function addLoadingMessage() {
    const id = Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.id = `loading-${id}`;
    loadingDiv.textContent = 'Thinking...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

// Remove loading message
function removeLoadingMessage(id) {
    const loadingDiv = document.getElementById(`loading-${id}`);
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Add an error message
function addErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error-message';
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    createModelForm.addEventListener('submit', createCustomModel);

    // Chat input
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Parameter sliders
    temperatureSlider.addEventListener('input', () => {
        temperatureValue.textContent = temperatureSlider.value;
    });

    topPSlider.addEventListener('input', () => {
        topPValue.textContent = topPSlider.value;
    });

    topKSlider.addEventListener('input', () => {
        topKValue.textContent = topKSlider.value;
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Create model section toggle
    createModelHeader.addEventListener('click', () => {
        toggleCollapsible(createModelHeader, createModelContent);
    });

    // Voice mode event listeners
    setupVoiceModeEventListeners();
}

// Toggle between light and dark theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    themeToggleBtn.textContent = isDarkTheme ? '☀️' : '🌙';
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Check user's theme preference
function checkThemePreference() {
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
        themeToggleBtn.textContent = '☀️';
    }
}

// Helper function to format file size
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// ===== VOICE MODE FUNCTIONALITY =====

// Initialize voice mode
function initializeVoiceMode() {
    // Check if voice clone exists
    checkVoiceCloneStatus();

    // Load voice mode preferences
    const voiceResponsesPref = localStorage.getItem('voiceResponsesEnabled');
    const voiceInputPref = localStorage.getItem('voiceInputEnabled');

    if (voiceResponsesPref === 'true') {
        voiceResponsesEnabled.checked = true;
    }

    if (voiceInputPref === 'true') {
        voiceInputEnabled.checked = true;
    }
}

// Setup voice mode event listeners
function setupVoiceModeEventListeners() {
    // Voice mode toggle
    voiceModeBtn.addEventListener('click', openVoiceMode);
    closeVoiceModeBtn.addEventListener('click', closeVoiceMode);

    // Recording controls
    startRecordingBtn.addEventListener('click', startRecording);
    stopRecordingBtn.addEventListener('click', stopRecording);
    recordAgainBtn.addEventListener('click', resetRecording);
    saveVoiceCloneBtn.addEventListener('click', saveVoiceClone);

    // Voice test
    testVoiceBtn.addEventListener('click', testVoice);

    // Settings toggles
    voiceResponsesEnabled.addEventListener('change', (e) => {
        localStorage.setItem('voiceResponsesEnabled', e.target.checked);
    });

    voiceInputEnabled.addEventListener('change', (e) => {
        localStorage.setItem('voiceInputEnabled', e.target.checked);
    });

    // Close overlay when clicking outside
    voiceModeOverlay.addEventListener('click', (e) => {
        if (e.target === voiceModeOverlay) {
            closeVoiceMode();
        }
    });
}

// Open voice mode overlay
function openVoiceMode() {
    voiceModeOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close voice mode overlay
function closeVoiceMode() {
    voiceModeOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Stop any ongoing recording
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    }
}

// Check if voice clone exists
async function checkVoiceCloneStatus() {
    try {
        const response = await fetch('/api/voice/status');
        if (response.ok) {
            const data = await response.json();
            hasVoiceClone = data.hasVoiceClone;
            voiceCloneId = data.voiceId;
            updateVoiceStatus();
        }
    } catch (error) {
        console.log('Voice status check failed:', error);
        hasVoiceClone = false;
        updateVoiceStatus();
    }
}

// Update voice status display
function updateVoiceStatus() {
    const statusIndicator = voiceStatus.querySelector('.status-indicator');
    const statusText = voiceStatus.querySelector('.status-text');

    if (hasVoiceClone) {
        statusIndicator.classList.add('active');
        statusText.textContent = 'Voice clone ready';
    } else {
        statusIndicator.classList.remove('active');
        statusText.textContent = 'No voice clone available';
    }
}

// Start recording voice sample
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 22050,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            recordedAudio.src = audioUrl;
            audioPreview.style.display = 'block';

            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
        };

        // Start recording
        mediaRecorder.start();
        recordingStartTime = Date.now();

        // Update UI
        startRecordingBtn.style.display = 'none';
        stopRecordingBtn.style.display = 'block';
        recordingTimer.style.display = 'block';

        // Start timer
        recordingInterval = setInterval(updateRecordingTimer, 100);

        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                stopRecording();
            }
        }, 30000);

    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Error accessing microphone. Please check permissions.');
    }
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    // Clear timer
    if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
    }

    // Update UI
    startRecordingBtn.style.display = 'block';
    stopRecordingBtn.style.display = 'none';
    recordingTimer.style.display = 'none';
}

// Update recording timer
function updateRecordingTimer() {
    if (recordingStartTime) {
        const elapsed = Date.now() - recordingStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const milliseconds = Math.floor((elapsed % 1000) / 100);
        timerDisplay.textContent = `${seconds.toString().padStart(2, '0')}:${milliseconds}`;
    }
}

// Reset recording
function resetRecording() {
    audioPreview.style.display = 'none';
    recordedAudio.src = '';
    audioChunks = [];
}

// Save voice clone
async function saveVoiceClone() {
    if (audioChunks.length === 0) {
        alert('No recording available to save.');
        return;
    }

    try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice_sample.webm');
        formData.append('voice_id', 'user_voice');

        const response = await fetch('/api/voice/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            hasVoiceClone = true;
            voiceCloneId = data.voice_id;
            updateVoiceStatus();
            alert('Voice clone saved successfully!');
            resetRecording();
        } else {
            throw new Error('Failed to save voice clone');
        }
    } catch (error) {
        console.error('Error saving voice clone:', error);
        alert('Error saving voice clone. Please try again.');
    }
}

// Test voice output
async function testVoice() {
    const text = testText.value.trim();
    if (!text) {
        alert('Please enter some text to test.');
        return;
    }

    if (!hasVoiceClone) {
        alert('Please create a voice clone first.');
        return;
    }

    try {
        testStatus.className = 'test-status loading';
        testStatus.textContent = 'Generating audio...';

        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                voice_id: voiceCloneId || 'user_voice'
            })
        });

        if (response.ok) {
            const data = await response.json();

            // Create and play audio
            const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
            audio.play();

            testStatus.className = 'test-status success';
            testStatus.textContent = 'Audio generated and playing!';
        } else {
            throw new Error('Failed to generate audio');
        }
    } catch (error) {
        console.error('Error testing voice:', error);
        testStatus.className = 'test-status error';
        testStatus.textContent = 'Error generating audio. Please try again.';
    }

    // Clear status after 3 seconds
    setTimeout(() => {
        testStatus.className = 'test-status';
        testStatus.textContent = '';
    }, 3000);
}

// Enhanced AI message function with voice support
function addAIMessageWithVoice(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';

    // Create message content with audio controls
    messageDiv.innerHTML = `
        <div class="message-text">${message}</div>
        <div class="audio-controls" style="margin-top: 10px; display: none;">
            <button class="play-audio-btn" onclick="playMessageAudio(this, '${message.replace(/'/g, "\\'")}')">
                🔊 Play Audio
            </button>
            <audio class="message-audio" controls style="display: none; width: 100%; margin-top: 5px;"></audio>
        </div>
    `;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Generate audio if voice responses are enabled
    if (voiceResponsesEnabled.checked && hasVoiceClone) {
        generateAudioForMessage(message, messageDiv);
    }
}

// Generate audio for a message
async function generateAudioForMessage(text, messageElement) {
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                voice_id: voiceCloneId || 'user_voice'
            })
        });

        if (response.ok) {
            const data = await response.json();
            const audioElement = messageElement.querySelector('.message-audio');
            const audioControls = messageElement.querySelector('.audio-controls');

            audioElement.src = `data:audio/wav;base64,${data.audio}`;
            audioControls.style.display = 'block';

            // Auto-play only if enabled
            if (voiceResponsesEnabled.checked) {
                audioElement.play().catch(e => {
                    console.log('Auto-play prevented by browser:', e);
                });
            }
        }
    } catch (error) {
        console.error('TTS generation failed:', error);
    }
}

// Play message audio
function playMessageAudio(button, text) {
    const messageElement = button.closest('.message');
    const audioElement = messageElement.querySelector('.message-audio');

    if (audioElement.src) {
        audioElement.play();
    } else {
        // Generate audio if not already generated
        generateAudioForMessage(text, messageElement);
    }
}

// Voice settings toggle handler
voiceResponsesEnabled.addEventListener('change', async (e) => {
    localStorage.setItem('voiceResponsesEnabled', e.target.checked);
    
    // Update server-side auto-play setting
    try {
        await fetch('/api/voice/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auto_play: e.target.checked
            })
        });
    } catch (error) {
        console.error('Failed to update voice settings:', error);
    }
});

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
