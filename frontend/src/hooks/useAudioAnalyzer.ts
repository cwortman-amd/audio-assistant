import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioData {
  frequency: Uint8Array;
  timeDomain: Uint8Array;
}

export const useAudioAnalyzer = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Mic refs
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

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

  // WebSocket Connection
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    socketRef.current = new WebSocket('ws://localhost:8000/ws/transcribe');

    socketRef.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsTranscribing(true);
    };

    socketRef.current.onmessage = (event) => {
      const text = event.data;
      // Backend now sends full transcription, so we replace instead of append
      setTranscription(text);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsTranscribing(false);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsTranscribing(false);
    };
  }, []);

  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // ... (existing refs)

  // ... (initAudioContext)

  // ... (WebSocket logic)

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
          // Send to WebSocket if open
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(e.data);
          }
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        console.log("Recording saved:", url);
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

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsMicOn(false);
    setIsRecording(false);
    setIsTranscribing(false);
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
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    } else {
      connectWebSocket();
      // Wait for connection? Or just start and let onopen handle it?
      // For simplicity, we start recording immediately, but maybe wait 100ms
      setTimeout(() => {
          mediaRecorderRef.current?.start(1000); // Chunk every 1s
          setIsRecording(true);
      }, 100);
    }
  }, [isMicOn, isRecording, connectWebSocket]);

  // Demo Audio Functions (Replay Recorded Audio)
  const playDemoAudio = useCallback(() => {
    if (!recordedAudioUrl) {
      console.warn("No recorded audio to play");
      return;
    }

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

    const audio = new Audio(recordedAudioUrl);
    audioElementRef.current = audio;

    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();

    gain.gain.value = 1.0;

    source.connect(gain);
    gain.connect(outputAnalyserRef.current!);
    outputAnalyserRef.current!.connect(ctx.destination);

    audio.onended = () => {
      setIsDemoPlaying(false);
    };

    audio.play();
    setIsDemoPlaying(true);
  }, [recordedAudioUrl]);

  const stopDemoAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
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
    transcription,
    isTranscribing,
    toggleMic,
    toggleRecording,
    toggleDemo,
    getAudioData,
    getOutputAudioData
  };
};
