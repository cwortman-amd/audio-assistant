import { useRef, useEffect } from 'react'
import { Mic, MicOff, Disc, Square, Play } from 'lucide-react'
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
    togglePlay,
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
          isDemoPlaying={isDemoPlaying}
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
          onClick={togglePlay}
          style={{
            borderColor: isDemoPlaying ? '#00ffff' : '#333',
          }}
          title={isDemoPlaying ? "Stop Demo" : "Play Demo"}
        >
          {isDemoPlaying ? <Square size={24} color="#00ffff" fill="#00ffff" /> : <Play size={24} color="#fff" />}
        </button>
      </div>
    </>
  )
}

export default App
