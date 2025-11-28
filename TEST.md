# Automated Integration Test Documentation

## Overview
This directory contains the automated end-to-end (E2E) integration tests for the Audio Assistant application.
The tests verify the full pipeline:
1.  **Audio Generation**: Synthetic speech is generated using `gTTS`.
2.  **Frontend Input**: The audio is injected into the browser as a fake microphone input.
3.  **Backend Transcription**: The audio is streamed to the backend and transcribed.
4.  **Verification**: The transcribed text is compared against the original synthetic text.

## Prerequisites
- **Python 3.8+**
- **FFmpeg** (must be in system PATH)
- **Backend Server**: Must be running on `http://localhost:8000`
- **Frontend Server**: Must be running on `http://localhost:5173`

## Setup
Install the required dependencies:
```bash
pip install pytest playwright gtts fuzzywuzzy python-Levenshtein pydub
playwright install chromium
```

## Running the Test
To run the integration test:
```bash
pytest tests/integration_test.py
```

## Test Logic
The test script `tests/integration_test.py` performs the following steps:
1.  Generates `tests/input.mp3` with the text "The quick brown fox jumps over the lazy dog".
2.  Converts the MP3 to `tests/input.wav` (required for Chrome audio injection).
3.  Launches a headless Chromium browser with `--use-file-for-fake-audio-capture`.
4.  Navigates to the frontend URL.
5.  Clicks the **Mic** button and then the **Record** button.
6.  Waits for the transcription to appear on the screen.
7.  Captures the text and calculates a fuzzy match ratio with the original text.
8.  Asserts that the match ratio is > 80%.

## Troubleshooting
- **"Mic button not found"**: Ensure the frontend is running and the UI is loaded.
- **"Timed out waiting for transcription"**: Check if the backend is running and receiving the websocket connection. Check backend logs for errors.
- **"ffmpeg not found"**: Install FFmpeg.
