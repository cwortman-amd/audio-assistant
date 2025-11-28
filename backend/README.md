# Audio Assistant Backend

## Objective
The backend is a high-performance WebSocket server designed to handle real-time audio streams. It uses OpenAI's Whisper model (via `faster-whisper`) to provide accurate speech-to-text transcription.

## Technologies
- **Python**: Core language.
- **FastAPI**: Web framework for handling WebSockets.
- **Faster Whisper**: Optimized implementation of the Whisper model.
- **FFmpeg**: For robust audio decoding.
- **NumPy**: For efficient audio data manipulation.

## Features
- **WebSocket Endpoint**: `/ws/transcribe` handles persistent connections for streaming audio.
- **Streaming Transcription**: Uses `ffmpeg` to decode incoming WebM chunks into raw PCM float32 data, allowing for continuous transcription without file corruption.
- **Audio Accumulation**: Maintains a buffer of the session's audio to provide context-aware transcription updates.

## Setup and Running

### Prerequisites
Ensure **FFmpeg** is installed on your system:
```bash
sudo apt-get install ffmpeg
```

### Installation
1.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Running the Server
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## Testing
An automated test script is provided to verify the transcription pipeline.
1.  Ensure the server is running.
2.  Run the test script:
    ```bash
    python test_transcription.py
    ```
    This script generates a sample audio file using TTS, sends it to the server, and verifies the response.

## Independent Execution
This server runs independently and can be accessed by any WebSocket client. It does not serve the frontend files.

## CLI Usage

The backend includes a command-line interface (CLI) for performing Text-to-Speech (TTS) and Speech-to-Text (STT) operations independently.

### Text-to-Speech (TTS)
Generate audio from text:
```bash
python cli.py tts "Hello world" --output output.mp3
```

### Speech-to-Text (STT)
Transcribe an audio file:
```bash
python cli.py stt output.mp3
```

## Playing Audio Output

To play the generated `.mp3` files on Linux, you can use various command-line tools or media players.

### Using `mpg123` (Command Line)
If not installed: `sudo apt-get install mpg123`
```bash
mpg123 output.mp3
```

### Using `ffplay` (Part of FFmpeg)
Since you already have FFmpeg installed:
```bash
ffplay -nodisp -autoexit output.mp3
```

### Using `vlc`
```bash
vlc output.mp3
```
