import { useEffect, useRef } from 'react';
import { AudioData } from '../hooks/useAudioAnalyzer';

interface VisualizerProps {
  getAudioData: () => AudioData | null;
  isMicOn: boolean;
}

const Visualizer = ({ getAudioData, isMicOn }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = getAudioData();

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!isMicOn || !data) {
        // Draw idle state (dim red circle)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.strokeStyle = '#330000';
        ctx.lineWidth = 2;
        ctx.stroke();

        requestRef.current = requestAnimationFrame(draw);
        return;
    }

    const { frequency, timeDomain } = data;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.4; // Base radius

    // 1. Draw Radial Frequency Bars
    const barCount = 120; // Number of bars
    const step = Math.floor(frequency.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = frequency[i * step];
      const percent = value / 255;
      const barHeight = percent * (Math.min(centerX, centerY) * 0.5);

      const angle = (i / barCount) * 2 * Math.PI;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(255, 0, 0, ${percent + 0.2})`; // Red with opacity based on volume
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 2. Draw Circular Volume Arc (Loudness)
    // Calculate RMS (Root Mean Square) for loudness
    let sum = 0;
    for (let i = 0; i < timeDomain.length; i++) {
        const amplitude = (timeDomain[i] - 128) / 128;
        sum += amplitude * amplitude;
    }
    const rms = Math.sqrt(sum / timeDomain.length);
    const volumeScale = 1 + (rms * 2); // Scale factor

    // Inner pulsing circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8 * volumeScale, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Fill inner circle with low opacity red
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fill();

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isMicOn, getAudioData]); // Re-bind if dependencies change

  // Handle resize
  useEffect(() => {
      const handleResize = () => {
          if (canvasRef.current) {
              canvasRef.current.width = window.innerWidth;
              canvasRef.current.height = window.innerHeight;
          }
      };
      window.addEventListener('resize', handleResize);
      handleResize(); // Init
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1 // Behind controls
      }}
    />
  );
};

export default Visualizer;
