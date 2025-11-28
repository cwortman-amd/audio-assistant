# Backend Testing Documentation

This directory contains several test scripts to verify the functionality of the Audio Assistant backend.

## Test Scripts

### 1. `test_tts_stt.py` (Integration Test)
**Description**: This is the primary end-to-end integration test. It verifies the full pipeline:
1.  Generates a sample audio file ("Hello this is a test...") using Google Text-to-Speech (`gTTS`).
2.  Connects to the backend WebSocket endpoint (`ws://localhost:8000/ws/transcribe`).
3.  Streams the generated audio in chunks to simulate a real-time client.
4.  Waits for the transcription response and asserts that it matches the original text.

**Usage**:
Ensure the backend server is running (`uvicorn server:app ...`) in a separate terminal.
```bash
python test_tts_stt.py
```

### 2. `test_stt.py` (Unit Test - Whisper)
**Description**: Tests the `WhisperService` class in isolation.
1.  Downloads a known sample audio file (JFK speech) from the internet.
2.  Initializes `WhisperService` with the `base` model on CPU.
3.  Transcribes the file locally (bypassing the WebSocket server).
4.  Asserts that the transcription contains expected key phrases ("fellow americans", etc.).

**Usage**:
Does *not* require the backend server to be running.
```bash
python test_stt.py
```

### 3. `test_interactive.py` (Manual TTS Test)
**Description**: A utility for testing Text-to-Speech generation manually.
1.  Prompts the user to enter text.
2.  Uses `TTSService` to generate an MP3 file (`interactive_output.mp3`).
3.  Saves the file for manual playback verification.

**Usage**:
```bash
python test_interactive.py
```

### 4. `tests/test_transcription.py`
**Description**: A basic unit test file likely used for CI/CD or `pytest` execution. It may contain similar logic to `test_stt.py` but structured for a test runner.

**Running All Tests**:
You can use `pytest` to discover and run compatible tests:
```bash
pytest
```
### 5. `check.sh` (Health Check)
**Description**: A shell script to verify that the API server is reachable.
1.  Sends a `HEAD` request to `http://localhost:8000/` (or host/port defined in `.env`).
2.  Checks for a `200 OK` response.

**Usage**:
```bash
./check.sh
```
