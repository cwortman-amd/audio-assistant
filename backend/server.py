from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from whisper_service import WhisperService
import os
import tempfile
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Whisper Service
# Using 'base' for faster testing, change to 'large-v3-turbo' for production if hardware allows
whisper_service = WhisperService(model_size="large-v3-turbo", device="cpu", compute_type="int8")

@app.get("/")
async def root():
    return {"message": "Whisper Backend is running"}

import ffmpeg
import numpy as np

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection accepted")

    # Create a unique temporary file for this session
    session_file = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
    session_file_path = session_file.name
    session_file.close() # Close handle so we can append in loop

    try:
        while True:
            # Receive audio data (bytes)
            data = await websocket.receive_bytes()

            # Append to session file
            with open(session_file_path, "ab") as f:
                f.write(data)

            try:
                # Decode the full audio file to PCM float32 using ffmpeg
                # This handles the WebM container and ensures Whisper gets clean raw audio
                out, _ = (
                    ffmpeg.input(session_file_path)
                    .output('-', format='f32le', acodec='pcm_f32le', ac=1, ar='16000')
                    .run(cmd='ffmpeg', capture_stdout=True, capture_stderr=True)
                )

                audio_data = np.frombuffer(out, np.float32)

                # Transcribe
                text = whisper_service.transcribe(audio_data)

                # Send back full text
                if text:
                    await websocket.send_text(text)
            except ffmpeg.Error as e:
                # ffmpeg might fail if the file is incomplete or too short, which is expected at the start
                # print(f"ffmpeg error: {e.stderr.decode()}")
                pass
            except Exception as e:
                print(f"Error during transcription: {e}")

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error in websocket: {e}")
    finally:
        # Clean up session file
        if os.path.exists(session_file_path):
            os.remove(session_file_path)
