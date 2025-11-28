import './index.css'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import Visualizer from './components/Visualizer'

function App() {
  const {
    isMicOn,
    isRecording,
    isDemoPlaying,
    toggleMic,
    toggleRecording,
    toggleDemo,
    getAudioData,
    getOutputAudioData
  } = useAudioAnalyzer();

  return (
    <>
      <div className="visualizer-container">
        <Visualizer
          getAudioData={getAudioData}
          getOutputAudioData={getOutputAudioData}
          isMicOn={isMicOn}
        />
      </div>

      <div className="control-panel">
        <button onClick={toggleMic} style={{ borderColor: isMicOn ? '#ff0000' : 'transparent' }}>
          {isMicOn ? 'Mic ON' : 'Mic OFF'}
        </button>

        <button
          onClick={toggleRecording}
          disabled={!isMicOn}
          style={{
            backgroundColor: isRecording ? '#ff0000' : '#1a1a1a',
            color: isRecording ? '#000' : (isMicOn ? '#fff' : '#666'),
            cursor: isMicOn ? 'pointer' : 'not-allowed'
          }}
        >
          {isRecording ? 'Stop Recording' : 'Record'}
        </button>

        <button
          onClick={toggleDemo}
          style={{
            borderColor: isDemoPlaying ? '#00ffff' : 'transparent',
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
