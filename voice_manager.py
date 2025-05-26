"""
Voice Manager for Ollama8Web
Handles voice cloning and text-to-speech functionality using pyttsx3
"""

import os
import io
import base64
import logging
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import pyttsx3
import wave
import numpy as np
import sys
import traceback
import time

# Configure logging with less verbosity
logging.basicConfig(
    level=logging.WARNING,  # Change to WARNING level to reduce logs
    format='%(levelname)s:%(message)s'  # Simplified format
)
logger = logging.getLogger(__name__)

class VoiceManager:
    """Manages voice cloning and TTS functionality"""
    
    def __init__(self, voices_dir: str = "voices"):
        self.voices_dir = Path(voices_dir)
        self.voices_dir.mkdir(exist_ok=True)
        self.auto_play = False  # Setting to control auto-play behavior
        
        try:
            # Initialize pyttsx3 engine
            self.tts_engine = pyttsx3.init()
            self.current_voice_id = None
            
            # Set default properties
            self.tts_engine.setProperty('rate', 150)    # Speed of speech
            self.tts_engine.setProperty('volume', 1.0)  # Volume (0-1)
            
            # Check available voices
            self.available_voices = self.tts_engine.getProperty('voices')
            
            if self.available_voices:
                # Set default voice
                default_voice = self.available_voices[0]
                self.tts_engine.setProperty('voice', default_voice.id)
                logger.info(f"Voice system initialized with {len(self.available_voices)} voices")
            else:
                logger.warning("No voices available in the system")
            
            # Test the engine with a simple string
            self.tts_engine.say("Test")
            self.tts_engine.runAndWait()
            
            self.tts_available = True
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS engine: {e}")
            logger.debug(traceback.format_exc())
            self.tts_available = False
            self.available_voices = []
    
    def set_auto_play(self, enabled: bool):
        """Set whether TTS should auto-play or wait for manual playback"""
        self.auto_play = enabled
        
    def text_to_speech(self, text: str, voice_id: Optional[str] = None) -> Optional[str]:
        """Convert text to speech and return base64 encoded audio"""
        if not self.tts_available:
            logger.error("TTS not available")
            return None
        
        if not text:
            logger.error("Empty text provided")
            return None
        
        temp_file = None
        try:
            # Create a temporary file for the audio
            temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
            temp_path = temp_file.name
            temp_file.close()  # Close the file handle immediately
            
            # Generate speech
            self.tts_engine.save_to_file(text, temp_path)
            self.tts_engine.runAndWait()
            
            # Small delay to ensure file is written
            time.sleep(0.1)
            
            # Read the generated audio file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            # Encode as base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            return audio_base64
            
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            logger.debug(traceback.format_exc())
            return None
            
        finally:
            # Clean up the temporary file
            if temp_file:
                try:
                    os.unlink(temp_file.name)
                except Exception as e:
                    logger.debug(f"Failed to clean up temporary file: {e}")
    
    def save_voice_sample(self, audio_data: bytes, voice_id: str = "user_voice") -> Dict[str, Any]:
        """Save a voice sample for future reference"""
        try:
            # Save the audio file
            voice_path = self.voices_dir / f"{voice_id}.wav"
            
            # Convert webm to wav if needed
            if self._is_webm_data(audio_data):
                audio_data = self._convert_webm_to_wav(audio_data)
            
            with open(voice_path, 'wb') as f:
                f.write(audio_data)
            
            logger.info(f"Voice sample saved: {voice_path}")
            
            # Set as current voice
            self.current_voice_id = voice_id
            
            return {
                "status": "success",
                "voice_id": voice_id,
                "path": str(voice_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to save voice sample: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _is_webm_data(self, data: bytes) -> bool:
        """Check if audio data is WebM format"""
        return data.startswith(b'\x1a\x45\xdf\xa3')
    
    def _convert_webm_to_wav(self, webm_data: bytes) -> bytes:
        """Convert WebM audio to WAV format"""
        try:
            from pydub import AudioSegment
            
            # Create audio segment from WebM data
            audio = AudioSegment.from_file(io.BytesIO(webm_data), format="webm")
            
            # Convert to WAV format
            audio = audio.set_frame_rate(22050).set_channels(1)
            
            # Export to WAV bytes
            wav_buffer = io.BytesIO()
            audio.export(wav_buffer, format="wav")
            
            return wav_buffer.getvalue()
            
        except ImportError:
            logger.warning("pydub not available for audio conversion")
            return webm_data
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            return webm_data
    
    def get_voice_status(self) -> Dict[str, Any]:
        """Get current voice status"""
        voice_files = list(self.voices_dir.glob("*.wav"))
        available_voices = [voice.name for voice in self.available_voices] if self.available_voices else []
        
        return {
            "hasVoiceClone": len(voice_files) > 0,
            "voiceId": self.current_voice_id,
            "availableVoices": available_voices,
            "ttsAvailable": self.tts_available
        }
    
    def cleanup(self):
        """Cleanup resources"""
        if hasattr(self, 'tts_engine'):
            try:
                self.tts_engine.stop()
            except:
                pass
        
        logger.info("Voice manager cleanup completed")

# Global voice manager instance
voice_manager = VoiceManager()
