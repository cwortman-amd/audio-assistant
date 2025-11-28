# Audio Assistant

## Objective
This project is a real-time audio transcription application. It captures audio from the user's microphone via a React frontend, streams it to a Python backend, and uses the `faster-whisper` library (specifically the `large-v3-turbo` model) to transcribe the speech into text in real-time.

## Project Structure
- **`frontend/`**: A React application built with Vite and TypeScript. It handles audio recording, visualization, and displaying the transcription.
- **`backend/`**: A Python FastAPI server. It receives audio streams via WebSockets, processes them using `ffmpeg` and `numpy`, and performs transcription using `faster-whisper`.

## Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **FFmpeg**: Required for audio decoding on the backend.
  ```bash
  sudo apt-get install ffmpeg
  ```

## Quick Start

### 1. Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
- Open your browser to `http://localhost:5173`.
- Click **"Mic OFF"** to enable the microphone.
- Click **"Record"** to start streaming audio to the backend.
- Speak clearly. The transcription will appear in the text box below the visualizer.
- Click **"Stop Recording"** to end the session.
- Click **"Play Demo"** to replay your recorded audio.

## Running Independently
The frontend and backend are decoupled and run as separate processes.
- **Backend**: Runs on port `8000`. Handles the WebSocket connection and transcription logic.
- **Frontend**: Runs on port `5173`. Serves the UI and connects to the backend.

You can start, stop, or restart either service without affecting the other (though functionality will be limited if one is down).

