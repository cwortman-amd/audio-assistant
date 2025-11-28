import { useState, useRef, useCallback } from 'react';

export interface AudioData {
  frequency: Uint8Array;
  timeDomain: Uint8Array;
}

export const useAudioAnalyzer = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Mic refs
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Output refs
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = initAudioContext();

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
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
    // Don't suspend context if demo is playing
    if (audioContextRef.current && !isDemoPlaying) {
      // audioContextRef.current.suspend(); // Optional: keep it running for smoother switching
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsMicOn(false);
    setIsRecording(false);
  }, [isDemoPlaying]);

  const toggleMic = useCallback(() => {
    if (isMicOn) {
      stopAudio();
    } else {
      startAudio();
    }
  }, [isMicOn, startAudio, stopAudio]);

  const toggleRecording = useCallback(() => {
    if (!isMicOn) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    }
  }, [isMicOn, isRecording]);

  // Demo Audio Functions
  const playDemoAudio = useCallback(() => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create Output Analyser if not exists
    if (!outputAnalyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        outputAnalyserRef.current = analyser;
    }

    // Create Oscillator (Sine wave sweeping)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 2);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 4);

    // Loop the frequency sweep
    // Note: standard oscillator doesn't loop frequency automation easily without custom logic or LFO.
    // For simplicity, let's just use an LFO to modulate frequency.

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // 0.5 Hz
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300; // Modulate by +/- 300Hz

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    gain.gain.value = 0.3; // Lower volume

    // Connect: Osc -> Gain -> OutputAnalyser -> Destination
    osc.connect(gain);
    gain.connect(outputAnalyserRef.current!);
    outputAnalyserRef.current!.connect(ctx.destination);

    osc.start();

    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
    setIsDemoPlaying(true);

    // Cleanup LFO when osc stops?
    // For this simple demo, we'll just stop the main osc. The LFO will be GC'd or we can track it.
    // To be cleaner, let's attach lfo to the ref or just let it run (it's cheap).
  }, []);

  const stopDemoAudio = useCallback(() => {
    if (oscillatorRef.current) {
        try {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
        } catch (e) { /* ignore */ }
        oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
    }
    setIsDemoPlaying(false);
  }, []);

  const toggleDemo = useCallback(() => {
      if (isDemoPlaying) {
          stopDemoAudio();
      } else {
          playDemoAudio();
      }
  }, [isDemoPlaying, playDemoAudio, stopDemoAudio]);

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

  const getOutputAudioData = useCallback((): AudioData | null => {
    if (!outputAnalyserRef.current) return null;

    const bufferLength = outputAnalyserRef.current.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeDomainData = new Uint8Array(bufferLength);

    outputAnalyserRef.current.getByteFrequencyData(frequencyData);
    outputAnalyserRef.current.getByteTimeDomainData(timeDomainData);

    return {
      frequency: frequencyData,
      timeDomain: timeDomainData
    };
  }, []);

  return {
    isMicOn,
    isRecording,
    isDemoPlaying,
    toggleMic,
    toggleRecording,
    toggleDemo,
    getAudioData,
    getOutputAudioData
  };
};
