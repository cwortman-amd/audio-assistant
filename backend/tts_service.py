from gtts import gTTS
import os

class TTSService:
    def __init__(self, lang="en"):
        self.lang = lang

    def generate_audio(self, text: str, output_file: str):
        """
        Generate audio from text and save to file.
        :param text: Text to convert to speech.
        :param output_file: Path to save the audio file.
        """
        try:
            print(f"Generating audio for: '{text}'")
            tts = gTTS(text=text, lang=self.lang)
            tts.save(output_file)
            print(f"Audio saved to {output_file}")
            return True
        except Exception as e:
            print(f"Error generating audio: {e}")
            return False
