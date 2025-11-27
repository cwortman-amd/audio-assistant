import { useState, useRef, useEffect, useCallback } from 'react';

export interface AudioData {
  frequency: Uint8Array;
  timeDomain: Uint8Array;
}

export const useAudioAnalyzer = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048; // Resolution of frequency data
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
      };
      mediaRecorderRef.current = mediaRecorder;

      setIsMicOn(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsMicOn(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsMicOn(false);
    setIsRecording(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (isMicOn) {
      stopAudio();
    } else {
      startAudio();
    }
  }, [isMicOn, startAudio, stopAudio]);

  const toggleRecording = useCallback(() => {
    if (!isMicOn) return; // Cannot record if mic is off

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    }
  }, [isMicOn, isRecording]);

  const getAudioData = useCallback((): AudioData | null => {
    if (!analyserRef.current) return null;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeDomainData = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(timeDomainData);

    return {
      frequency: frequencyData,
      timeDomain: timeDomainData
    };
  }, []);

  return {
    isMicOn,
    isRecording,
    toggleMic,
    toggleRecording,
    getAudioData
  };
};
