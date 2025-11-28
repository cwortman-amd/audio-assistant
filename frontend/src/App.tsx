import { useRef, useEffect } from 'react'
import './index.css'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import Visualizer from './components/Visualizer'

function App() {
  const {
    isMicOn,
    isRecording,
    isDemoPlaying,
    transcription,
    isTranscribing,
    toggleMic,
    toggleRecording,
    toggleDemo,
    getAudioData,
    getOutputAudioData
  } = useAudioAnalyzer();

  const transcriptionBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptionBoxRef.current) {
      transcriptionBoxRef.current.scrollTop = transcriptionBoxRef.current.scrollHeight;
    }
  }, [transcription]);

  return (
    <>
      <div className="visualizer-container">
        <Visualizer
          getAudioData={getAudioData}
          getOutputAudioData={getOutputAudioData}
          isMicOn={isMicOn}
        />
      </div>

      <div className="transcription-overlay" style={{
        position: 'absolute',
        bottom: '150px',
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
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '1rem',
            minHeight: '100px',
            maxHeight: '200px',
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
        <button onClick={toggleMic} style={{ borderColor: isMicOn ? '#ff0000' : '#333' }}>
          {isMicOn ? 'Mic ON' : 'Mic OFF'}
        </button>

        <button
          onClick={toggleRecording}
          disabled={!isMicOn}
          style={{
            backgroundColor: isRecording ? '#ff0000' : 'transparent',
            borderColor: isRecording ? '#ff0000' : '#333',
            color: isRecording ? '#000' : (isMicOn ? '#fff' : '#666'),
            cursor: isMicOn ? 'pointer' : 'not-allowed'
          }}
        >
          {isRecording ? 'Stop Recording' : 'Record'}
        </button>

        <button
          onClick={toggleDemo}
          style={{
            borderColor: isDemoPlaying ? '#00ffff' : '#333',
            color: isDemoPlaying ? '#00ffff' : '#fff'
          }}
        >
          {isDemoPlaying ? 'Stop Demo' : 'Play Demo'}
        </button>
      </div>
    </>
  )
}

export default App
