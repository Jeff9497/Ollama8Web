# 🎤 Ollama8Web Voice Mode Setup Guide

## Overview

Ollama8Web now includes advanced voice cloning and text-to-speech capabilities using RealtimeTTS + XTTS-v2. This allows you to:

- ✅ Clone your voice with just 10-15 seconds of audio
- ✅ Get AI responses in your own voice
- ✅ Completely local processing (no cloud services)
- ✅ High-quality neural voice synthesis

## 🔧 Installation

### Step 1: Install Voice Dependencies

```bash
# Install voice cloning dependencies
pip install -r voice_requirements.txt
```

### Step 2: Install System Dependencies

#### Windows:
1. Download and install FFmpeg from https://ffmpeg.org/download.html
2. Add FFmpeg to your system PATH
3. For GPU acceleration, install CUDA Toolkit from NVIDIA

#### Linux/Mac:
```bash
# Install FFmpeg
sudo apt install ffmpeg  # Ubuntu/Debian
brew install ffmpeg      # macOS

# For GPU support, install CUDA toolkit
```

### Step 3: Verify Installation

```bash
# Test the installation
python -c "from RealtimeTTS import TextToAudioStream, CoquiEngine; print('Voice features ready!')"
```

## 🎯 Hardware Requirements

### Minimum Requirements:
- **RAM**: 8GB system RAM
- **GPU**: NVIDIA GPU with 4GB VRAM (for real-time performance)
- **Storage**: 5GB free space for models
- **CPU**: Modern multi-core processor

### Recommended Setup:
- **RAM**: 16GB+ system RAM
- **GPU**: RTX 3070/4070 or better (8GB+ VRAM)
- **Storage**: SSD with 10GB+ free space

### Performance Expectations:
- **Voice cloning**: 2-5 minutes setup time per voice
- **Audio generation**: 1-3 seconds per sentence
- **Real-time synthesis**: Possible with recommended hardware

## 🚀 Using Voice Mode

### 1. Access Voice Mode
- Click the 🎤 button next to the theme toggle in the header
- This opens the Voice Mode interface

### 2. Create Your Voice Clone
1. **Record Voice Sample**: Click "Start Recording"
2. **Speak Clearly**: Record 10-15 seconds of natural speech
3. **Preview**: Listen to your recording
4. **Save**: Click "Save Voice Clone" to process

### 3. Enable Voice Responses
- Toggle "Enable Voice Responses" in the Voice Chat section
- AI responses will now be automatically converted to audio using your voice

### 4. Test Your Voice
- Use the "Test Voice Output" section to verify quality
- Enter sample text and click "Test Voice"

## 🛠️ Troubleshooting

### Common Issues:

#### "Voice features not available" Error
```bash
# Solution: Install dependencies
pip install realtimetts[coqui]
pip install pydub soundfile librosa
```

#### GPU Memory Issues
- Reduce model size or use CPU-only mode
- Close other GPU-intensive applications
- Consider upgrading GPU memory

#### Audio Quality Issues
- Ensure quiet recording environment
- Use a good quality microphone
- Record 15+ seconds for better cloning

#### Slow Performance
- Check GPU utilization
- Ensure CUDA is properly installed
- Consider using shorter text for generation

### Performance Optimization:

#### For 8GB RAM Systems:
- Close unnecessary applications
- Use shorter voice samples (10-12 seconds)
- Generate shorter text segments

#### For Better Quality:
- Record in a quiet environment
- Use consistent speaking pace
- Avoid background noise

## 🔒 Privacy & Security

### Local Processing Benefits:
- ✅ No data sent to external servers
- ✅ Complete privacy control
- ✅ No internet dependency for core functionality
- ✅ No usage limits or API costs

### Voice Data Storage:
- Voice samples stored locally in `voices/` directory
- Files are not encrypted by default
- You can delete voice samples anytime

## 📊 Technical Details

### Voice Cloning Technology:
- **Engine**: XTTS-v2 (Coqui TTS)
- **Sample Requirement**: 6+ seconds minimum, 10-15 seconds recommended
- **Languages**: 16 languages supported
- **Quality**: Professional-grade voice cloning

### Audio Specifications:
- **Format**: WAV (22050 Hz mono 16-bit)
- **Input**: WebM from browser, converted to WAV
- **Output**: Base64-encoded WAV for web playback

### API Endpoints:
- `GET /api/voice/status` - Check voice clone status
- `POST /api/voice/upload` - Upload voice sample
- `POST /api/tts` - Generate text-to-speech

## 🎨 Customization

### Voice Sample Management:
- Voice samples stored in `voices/` directory
- Each voice has a unique ID (default: "user_voice")
- Multiple voices can be stored and switched between

### Integration Options:
- Voice responses can be toggled on/off
- Audio controls appear with each AI message
- Manual audio generation available via play buttons

## 🔄 Updates and Maintenance

### Updating Voice Models:
```bash
# Update RealtimeTTS
pip install --upgrade realtimetts[coqui]
```

### Clearing Voice Data:
```bash
# Remove all voice samples
rm -rf voices/
```

### Model Cache:
- TTS models are cached automatically
- First run downloads ~2GB of models
- Subsequent runs are much faster

## 💡 Tips for Best Results

1. **Recording Quality**: Use a good microphone in a quiet environment
2. **Speaking Style**: Speak naturally and consistently
3. **Sample Length**: 15-20 seconds provides best cloning quality
4. **Text Length**: Shorter sentences generate faster and more reliably
5. **Hardware**: GPU acceleration significantly improves performance

## 🆘 Support

If you encounter issues:

1. Check the console output for error messages
2. Verify all dependencies are installed correctly
3. Ensure sufficient system resources are available
4. Try recording a new voice sample if quality is poor

For technical support, check the project documentation or create an issue with:
- Your system specifications
- Error messages from console
- Steps to reproduce the issue

---

**Enjoy your personalized AI voice experience with Ollama8Web! 🎉**
