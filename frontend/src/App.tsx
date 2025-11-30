import { useRef, useEffect, useState } from 'react'
import { Mic, MicOff, Disc, Square, Play, Settings as SettingsIcon } from 'lucide-react'
import './index.css'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import Visualizer from './components/Visualizer'
import SettingsModal, { Settings } from './components/SettingsModal'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    audioOutput: 'opus',
    saveFolder: '',
    filenamePrefix: 'recording',
    maxDuration: 60,
    transcriptionEnabled: true,
    transcriptionMode: 'recording'
  });

  const {
    isMicOn,
    isRecording,
    isRecordingPlaying,
    transcription,
    isTranscribing,
    toggleMic,
    toggleRecording,
    togglePlayback,
    getAudioData,
    getOutputAudioData
  } = useAudioAnalyzer(settings);

  const transcriptionBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptionBoxRef.current) {
      transcriptionBoxRef.current.scrollTop = transcriptionBoxRef.current.scrollHeight;
    }
  }, [transcription]);

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <div className="visualizer-container">
        <Visualizer
          getAudioData={getAudioData}
          getOutputAudioData={getOutputAudioData}
          isMicOn={isMicOn}
          isDemoPlaying={isRecordingPlaying}
        />
      </div>

      <div className="transcription-overlay" style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '800px',
        textAlign: 'center',
        zIndex: 10
      }}>
        {isTranscribing && (
          <div className="text-sm text-cyan-400 mb-2 font-mono animate-pulse">
            Transcribing...
          </div>
        )}
        <div
          ref={transcriptionBoxRef}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            /* Line height is 1.5. 3 lines = 4.5em. Padding is 1rem top + 1rem bottom = 2rem. */
            /* We want it to be compact. */
            height: 'auto',
            maxHeight: 'calc(1.5em * 3 + 2rem)',
            overflowY: 'auto',
            color: '#e5e7eb',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            lineHeight: '1.5',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          {transcription || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Transcription will appear here...</span>}
        </div>
      </div>

      <div className="control-panel">
        <button
          onClick={toggleMic}
          style={{ borderColor: isMicOn ? '#ff0000' : '#333' }}
          title={isMicOn ? "Turn Mic Off" : "Turn Mic On"}
        >
          {isMicOn ? <Mic size={24} color="#ff0000" /> : <MicOff size={24} color="#666" />}
        </button>

        <button
          onClick={toggleRecording}
          disabled={!isMicOn}
          style={{
            backgroundColor: isRecording ? '#ff0000' : 'transparent',
            borderColor: isRecording ? '#ff0000' : '#333',
            cursor: isMicOn ? 'pointer' : 'not-allowed'
          }}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? <Square size={24} color="#000" fill="#000" /> : <Disc size={24} color={isMicOn ? "#fff" : "#666"} />}
        </button>

        <button
          onClick={togglePlayback}
          style={{
            borderColor: isRecordingPlaying ? '#00ffff' : '#333',
          }}
          title={isRecordingPlaying ? "Stop Playback" : "Play Recording"}
        >
          {isRecordingPlaying ? <Square size={24} color="#00ffff" /> : <Play size={24} color={isMicOn ? "#fff" : "#666"} />}
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{ borderColor: '#333' }}
          title="Settings"
        >
          <SettingsIcon size={24} color={isMicOn ? "#fff" : "#666"} />
        </button>
      </div>
    </>
  )
}

export default App
