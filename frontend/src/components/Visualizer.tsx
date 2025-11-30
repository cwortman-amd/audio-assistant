import { useEffect, useRef } from 'react';
import { AudioData } from '../hooks/useAudioAnalyzer';

interface VisualizerProps {
  getAudioData: () => AudioData | null;
  getOutputAudioData?: () => AudioData | null;
  isMicOn: boolean;
  isDemoPlaying: boolean;
}

const Visualizer = ({ getAudioData, getOutputAudioData, isMicOn, isDemoPlaying }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const micData = getAudioData();
    const outputData = getOutputAudioData ? getOutputAudioData() : null;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.4;

    // --- 1. Draw Outer Circle (Mic Input - Frequency Bars) ---
    if (isMicOn && micData) {
        const { frequency } = micData;
        const barCount = 120;
        const step = Math.floor(frequency.length / barCount);

        for (let i = 0; i < barCount; i++) {
            const value = frequency[i * step];
            const percent = value / 255;
            const barHeight = percent * (Math.min(centerX, centerY) * 0.5);

            const angle = (i / barCount) * 2 * Math.PI;

            const x1 = centerX + Math.cos(angle) * baseRadius;
            const y1 = centerY + Math.sin(angle) * baseRadius;
            const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
            const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(255, 0, 0, ${percent + 0.2})`;
            ctx.lineWidth = 3; // Active Mic
            ctx.stroke();
        }
    } else {
        // Idle state ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        // Color for inactive mic
        ctx.strokeStyle = '#330000';
        ctx.lineWidth = 1; // Inactive Mic
        ctx.stroke();
    }

    // --- 2. Draw Inner Circle (Audio Out - Waveform) ---
    if (outputData) {
        const { timeDomain } = outputData;
        const innerRadius = baseRadius * 0.8; // Smaller than outer ring

        ctx.beginPath();
        ctx.lineWidth = isDemoPlaying ? 3 : 1; // Dynamic line width based on demo state
        ctx.strokeStyle = '#00ffff'; // Cyan for output to distinguish

        const sliceWidth = (Math.PI * 2) / timeDomain.length;
        let angle = 0;

        for (let i = 0; i < timeDomain.length; i++) {
            const v = timeDomain[i] / 128.0; // 0..2, 1 is center
            // Map v to radius deviation
            // v=1 -> radius = innerRadius
            // v>1 -> radius > innerRadius
            // v<1 -> radius < innerRadius

            // Amplify the wave effect slightly
            const radius = innerRadius + (v - 1) * (innerRadius * 0.3);

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            angle += sliceWidth;
        }

        ctx.closePath();
        ctx.stroke();

        // Add a glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isMicOn, getAudioData, getOutputAudioData]);

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
        zIndex: 1
      }}
    />
  );
};

export default Visualizer;
