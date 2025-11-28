import os
import pytest
from tts_service import TTSService

def test_user_input_to_audio():
    if "PYTEST_CURRENT_TEST" in os.environ:
        pytest.skip("Skipping interactive test in automated run")
    print("--- Interactive TTS Test ---")
    text = input("Enter text to convert to speech: ")

    if not text:
        print("No text entered. Exiting.")
        return

    output_file = "interactive_output.mp3"

    tts = TTSService()
    success = tts.generate_audio(text, output_file)

    if success:
        print(f"Success! Audio saved to {output_file}")
        print("You can play it using a media player, e.g., 'vlc interactive_output.mp3' or 'afplay interactive_output.mp3' (macOS) or 'aplay' (linux wav) etc.")

        # Optional: Try to play it if on linux and mpg123 or similar is installed?
        # User asked to "provide audio output to file or to speaker".
        # Playing audio from python reliably cross-platform without heavy deps is tricky.
        # We'll just notify the user.
    else:
        print("Failed to generate audio.")

if __name__ == "__main__":
    test_user_input_to_audio()
