# Cross-Platform Real-time Audio Visualizer Implementation Plan

## Goal Description
Create a cross-platform application that visualizes real-time audio input. To ensure compatibility with **Linux, Windows, and iOS**, the project will be built as a **Modern Web Application** using **React**, **Vite**, and the standard **Web Audio API**. This allows the app to run in any modern browser on all requested platforms.

## User Review Required
> [!IMPORTANT]
> **Technology Shift**: The original request mentioned `AVFoundation` and `Metal` (Apple-exclusive). To support Linux and Windows, I have switched the stack to **Web Audio API** (Audio) and **HTML5 Canvas** (Graphics). This ensures the app works everywhere without maintaining three separate native codebases.

## Proposed Changes

### Project Structure
I will initialize a new Vite project with React and TypeScript.

#### [NEW] [package.json](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/package.json)
- Dependencies: `react`, `react-dom`.
- DevDependencies: `vite`, `typescript`, `@types/react`.

#### [NEW] [index.html](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/index.html)
- Entry point for the web application.

### Phase 1: Core Setup

#### [NEW] [src/App.tsx](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/src/App.tsx)
- Main application layout.
- **UI Controls**:
    - **Mic Toggle**: Button to enable/disable microphone input.
    - **Record Button**: Button to start/stop recording audio to a file.
- Handles "Start Audio" user gesture (required by browsers).

#### [NEW] [src/index.css](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/src/index.css)
- Global styles, dark mode theme for "Premium" feel.

### Phase 2: Audio Engine (Web Audio API)

#### [NEW] [src/hooks/useAudioAnalyzer.ts](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/src/hooks/useAudioAnalyzer.ts)
- Manages `AudioContext` and `AnalyserNode`.
- Requests microphone access via `navigator.mediaDevices.getUserMedia`.
- **Recording**: Uses `MediaRecorder` API to capture and save audio.
- Exposes `getFrequencyData()` and `getTimeDomainData()` (for loudness).

### Phase 3: Visualization Engine (Canvas)

#### [NEW] [src/components/Visualizer.tsx](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/src/components/Visualizer.tsx)
- Contains the `<canvas>` element.
- Runs the `requestAnimationFrame` loop.
- **Rendering Logic (Reference Style)**:
    - **Theme**: High-contrast **Red & Black**.
    - **Radial Frequency Bars**: Frequency data rendered as lines radiating from a central circle.
    - **Circular Volume Arc**: Loudness (RMS) rendered as a progress-bar-style arc inside or around the frequency lines.

### Phase 4: Cross-Platform Polish

#### [MODIFY] [src/App.tsx](file:///c:/Users/cwortman/.gemini/antigravity/playground/frozen-comet/src/App.tsx)
- Ensure UI controls (Start/Stop) are touch-friendly for iOS.
- Responsive layout for different screen sizes (Desktop vs Mobile).

### Phase 5: Audio Out Visualization

#### [MODIFY] [src/hooks/useAudioAnalyzer.ts](file:///home/cwortman/workspace/audio-assistant/src/hooks/useAudioAnalyzer.ts)
- Add `Audio` element or `AudioBufferSourceNode` management.
- Create a second `AnalyserNode` for the output audio.
- Expose `getOutputAudioData()` to return frequency/time data for the output.
- Add `playDemoAudio()` and `stopDemoAudio()` functions.

#### [MODIFY] [src/components/Visualizer.tsx](file:///home/cwortman/workspace/audio-assistant/src/components/Visualizer.tsx)
- Accept `getOutputAudioData` prop.
- **Rendering Logic**:
    - **Outer Circle**: Keep existing microphone frequency bars.
    - **Inner Circle**: Render the output audio waveform (time domain data) inside the listening circle.
    - Style it to look like a "wave file" (oscilloscope style).

#### [MODIFY] [src/App.tsx](file:///home/cwortman/workspace/audio-assistant/src/App.tsx)
- Add "Play Demo" button to trigger audio output.

## Verification Plan

### Automated Tests
- `npm run build` to verify TypeScript compilation.

### Manual Verification
- **Browser Compatibility**:
    - **Windows/Linux**: Open in Chrome/Firefox/Edge. Verify microphone input and visualization.
    - **iOS**: Open in Safari. Verify "Start" button triggers microphone prompt and audio context resumes (iOS requires user gesture).
- **Visuals**:
    - Check if the circle pulses with volume.
    - Check if frequency lines react to pitch changes.
