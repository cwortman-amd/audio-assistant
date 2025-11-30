from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from whisper_service import WhisperService
import os
import tempfile
import asyncio
import time

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
whisper_service = WhisperService(model_size="base", device="cpu", compute_type="int8")

@app.get("/")
async def root():
    return {"message": "Whisper Backend is running"}

import ffmpeg
import numpy as np

import shutil
from pathlib import Path

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket, save_folder: str = None, filename_prefix: str = "recording", format: str = "opus"):
    await websocket.accept()
    print(f"WebSocket connection accepted. Save Folder: {save_folder}, Prefix: {filename_prefix}, Format: {format}")

    # Create a unique temporary file for this session
    # Use .webm as container for Opus (default from MediaRecorder)
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
        # Save file if requested
        if save_folder and os.path.exists(session_file_path):
            try:
                # Ensure directory exists
                target_path = Path(save_folder)
                target_path.mkdir(parents=True, exist_ok=True)

                # Generate filename with date
                # Format: prefix_YYYY-MM-DD_HH-MM-SS.webm
                timestamp_str = time.strftime("%Y-%m-%d_%H-%M-%S")
                filename = f"{filename_prefix}_{timestamp_str}.webm"
                target_file = target_path / filename

                # If user requested mp3, we should convert.
                # For now, we just copy the webm.
                # TODO: Implement conversion if format=='mp3'

                shutil.copy2(session_file_path, target_file)
                print(f"Saved recording to {target_file}")
            except Exception as e:
                print(f"Failed to save recording: {e}")

        # Clean up session file
        if os.path.exists(session_file_path):
            os.remove(session_file_path)
