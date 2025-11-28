# Audio Assistant Frontend

## Objective
The frontend serves as the user interface for the Audio Assistant. It provides a modern, interactive experience with a circular audio visualizer, intuitive controls for recording, and a real-time display for transcribed text.

## Technologies
- **React**: UI library.
- **Vite**: Build tool and development server.
- **TypeScript**: Type safety.
- **WebSocket**: Real-time communication with the backend.
- **Canvas API**: For the custom circular audio visualizer.

## Features
- **Real-time Audio Visualization**: Reacts to both microphone input and audio playback.
- **Streaming Audio**: Captures microphone input and streams it to the backend via WebSockets.
- **Live Transcription**: Displays transcription text updates in real-time.
- **Audio Replay**: Allows users to listen back to their recorded session.

## Setup and Running

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Usage
1.  **Mic Control**: Toggle the microphone on/off.
2.  **Recording**: Start/Stop recording. Audio is sent to the backend only while recording.
3.  **Demo**: Play back the last recorded audio clip.

## Configuration
- The WebSocket URL is configured in `src/hooks/useAudioAnalyzer.ts` (default: `ws://localhost:8000/ws/transcribe`).

## Independent Execution
This frontend application runs independently of the backend. However, for transcription features to work, the backend server must be running and accessible at the configured WebSocket URL.
