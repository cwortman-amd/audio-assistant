import React from 'react';
import { X } from 'lucide-react';

export interface Settings {
  audioOutput: 'opus' | 'mp3';
  saveFolder: string;
  filenamePrefix: string;
  maxDuration: number; // minutes
  transcriptionEnabled: boolean;
  transcriptionMode: 'recording' | 'continuous';
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        border: '1px solid #333',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        color: '#fff',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Settings</h2>

        {/* Audio Output */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
            Audio Output Format
            <select
              value={settings.audioOutput}
              onChange={(e) => handleChange('audioOutput', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#000',
                color: '#fff',
                marginTop: '0.5rem'
              }}
            >
              <option value="opus">Opus (WebM) - Default</option>
              <option value="mp3">MP3 (Requires Backend)</option>
            </select>
          </label>
        </div>

        {/* Save Folder */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
            Save Folder (Server Path)
            <input
              type="text"
              value={settings.saveFolder}
              onChange={(e) => handleChange('saveFolder', e.target.value)}
              placeholder="/home/user/recordings"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#000',
                color: '#fff',
                marginTop: '0.5rem'
              }}
            />
          </label>
        </div>

        {/* Filename Prefix */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
            Filename Prefix
            <input
              type="text"
              value={settings.filenamePrefix}
              onChange={(e) => handleChange('filenamePrefix', e.target.value)}
              placeholder="recording"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#000',
                color: '#fff',
                marginTop: '0.5rem'
              }}
            />
          </label>
        </div>

        {/* Max Duration */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
            Max Recording Duration (Minutes)
            <input
              type="number"
              min="1"
              value={settings.maxDuration}
              onChange={(e) => handleChange('maxDuration', parseInt(e.target.value) || 60)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#000',
                color: '#fff',
                marginTop: '0.5rem'
              }}
            />
          </label>
        </div>

        {/* Transcription Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#ccc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.transcriptionEnabled}
              onChange={(e) => handleChange('transcriptionEnabled', e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Enable Transcription
          </label>
        </div>

        {/* Transcription Mode */}
        {settings.transcriptionEnabled && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
              Transcription Mode
              <select
                value={settings.transcriptionMode}
                onChange={(e) => handleChange('transcriptionMode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#000',
                  color: '#fff',
                  marginTop: '0.5rem'
                }}
              >
                <option value="recording">Only When Recording/Playing</option>
                <option value="continuous">Continuous (Always On)</option>
              </select>
            </label>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsModal;
