import asyncio
import websockets
import os
from gtts import gTTS

async def test_transcription():
    uri = "ws://localhost:8000/ws/transcribe"
    text_to_speak = "Hello this is a test of the audio transcription system"
    audio_file = "test_audio.mp3"

    print(f"Generating audio for: '{text_to_speak}'")
    tts = gTTS(text=text_to_speak, lang='en')
    tts.save(audio_file)

    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected. Sending audio...")

            # Read audio file and send in chunks
            with open(audio_file, "rb") as f:
                while True:
                    chunk = f.read(4096)
                    if not chunk:
                        break
                    await websocket.send(chunk)
                    # Small delay to simulate real-time streaming
                    await asyncio.sleep(0.01)

            print("Audio sent. Waiting for transcription...")

            # Wait for a response (with timeout)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"Received transcription: '{response}'")

                if "test" in response.lower() or "hello" in response.lower():
                    print("SUCCESS: Transcription matches expected content.")
                else:
                    print("FAILURE: Transcription does not match.")

            except asyncio.TimeoutError:
                print("FAILURE: Timed out waiting for transcription.")

    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if os.path.exists(audio_file):
            os.remove(audio_file)

if __name__ == "__main__":
    asyncio.run(test_transcription())
