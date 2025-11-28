# BUILD.md - Audio Assistant Backend Architecture

## 1. Introduction

### 1.1. Background
The Audio Assistant Backend is designed to serve as the intelligent auditory cortex of a larger application ecosystem. In modern web applications, real-time voice interaction is becoming increasingly critical. This project addresses the need for a high-performance, privacy-focused (local execution), and easy-to-integrate service that handles the complexities of audio processing and machine learning inference.

### 1.2. Objective
The primary objective is to build a robust, standalone backend service that provides:
*   **Real-time Speech-to-Text (STT)**: Converting streaming audio into text with low latency.
*   **Text-to-Speech (TTS)**: Converting text into natural-sounding audio.
*   **Interoperability**: Exposing these capabilities via standard interfaces (WebSocket API and CLI) to support various clients (Web, Terminal, Mobile).

## 2. Success Criteria

To consider the implementation successful, the system must meet the following criteria:

### 2.1. Functional Requirements
*   **Transcription Accuracy**: The system must accurately transcribe clear English speech using the OpenAI Whisper model.
*   **Real-time Processing**: The WebSocket endpoint must accept continuous audio streams and return partial or final transcriptions without dropping the connection.
*   **Bidirectional Capability**: The system must support both STT (Audio -> Text) and TTS (Text -> Audio).
*   **CLI Operation**: Users must be able to perform STT and TTS tasks directly from the command line without running the full server.

### 2.2. Non-Functional Requirements
*   **Latency**: Transcription results should be returned within a reasonable timeframe (aiming for near real-time perception).
*   **Reliability**: The server should handle client disconnections gracefully and clean up temporary resources (files).
*   **Maintainability**: The code must be modular, separating the API layer from the core ML services (`WhisperService`, `TTSService`).

## 3. System Architecture

The system follows a layered architecture:

1.  **Interface Layer**:
    *   **FastAPI / WebSockets**: Handles network communication.
    *   **CLI (`argparse`)**: Handles command-line arguments.
2.  **Service Layer**:
    *   **`WhisperService`**: Wraps the `faster-whisper` library for inference.
    *   **`TTSService`**: Wraps `gTTS` for audio generation.
3.  **Infrastructure Layer**:
    *   **FFmpeg**: Handles audio decoding and format conversion.
    *   **File System**: Manages temporary audio buffers.

## 4. API Reference

### 4.1. WebSocket API
**Endpoint**: `ws://<HOST>:<PORT>/ws/transcribe`

*   **Protocol**:
    *   **Client -> Server**: Binary messages containing raw audio chunks (WebM, WAV, etc.). The server accumulates these chunks.
    *   **Server -> Client**: Text messages containing the transcription of the accumulated audio.
*   **Behavior**:
    *   The server maintains a session-specific temporary file.
    *   On every received chunk, the server appends to the file, decodes the *entire* buffer to PCM, and re-transcribes.
    *   *Note: This is a naive "growing buffer" approach suitable for short sessions.*

### 4.2. HTTP API
**Endpoint**: `GET /`
*   **Description**: Health check endpoint.
*   **Response**: `{"message": "Whisper Backend is running"}` (JSON)

### 4.3. CLI Interface
**Command**: `python cli.py <subcommand> [args]`

*   **`tts`**: Text-to-Speech
    *   `text`: The string to convert.
    *   `--output`: Output filename (default: `output.mp3`).
    *   `--lang`: Language code (default: `en`).
*   **`stt`**: Speech-to-Text
    *   `audio_file`: Path to the input audio file.
    *   `--model`: Whisper model size (default: `base`).

## 5. Component Implementation Guide

This section details the specific implementation requirements for an AI agent or developer recreating the system.

### 5.1. Prerequisites
*   **OS**: Linux (Ubuntu/Debian recommended).
*   **System Dependencies**: `ffmpeg` (Required for `faster-whisper` and audio processing).
    *   `sudo apt-get install ffmpeg`
*   **Python**: Version 3.8+.

### 5.2. Dependencies (`requirements.txt`)
```text
fastapi
uvicorn
faster-whisper
websockets
python-multipart
pytest
httpx
gTTS
```

### 5.3. Core Services

#### `backend/whisper_service.py`
*   **Class**: `WhisperService`
*   **Responsibilities**:
    *   Initialize `WhisperModel` (default: `base`, `cpu`, `int8`).
    *   Method `transcribe(audio, language="en")`: Returns string. Handles exceptions.

#### `backend/tts_service.py`
*   **Class**: `TTSService`
*   **Responsibilities**:
    *   Initialize with language.
    *   Method `generate_audio(text, output_file)`: Uses `gTTS` to save MP3. Returns boolean success status.

### 5.4. Application Entry Points

#### `backend/server.py`
*   **Framework**: FastAPI.
*   **Middleware**: CORS (allow all).
*   **Global State**: Instance of `WhisperService`.
*   **Logic**:
    *   Accept WebSocket.
    *   Create `tempfile.NamedTemporaryFile`.
    *   Loop: Receive bytes -> Write to temp -> `ffmpeg` decode -> Transcribe -> Send Text.
    *   Cleanup temp file on disconnect.

#### `backend/cli.py`
*   **Library**: `argparse`.
*   **Logic**: Routes subcommands (`tts`, `stt`) to the respective service classes. Handles file I/O and prints results to stdout.

## 6. Testing Strategy

*   **Integration (`test_tts_stt.py`)**: Validates the full WebSocket pipeline by generating audio and sending it to the running server.
*   **Unit (`test_stt.py`)**: Validates the `WhisperService` by downloading a known sample (e.g., JFK speech) and checking transcription keywords.
*   **Manual (`test_interactive.py`)**: Validates TTS by allowing the user to type text and listen to the generated file.
*   **Health Check (`check.sh`)**: A shell script using `curl` to verify the HTTP endpoint is up.
