
import React from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioLevel, isRecording, className }) => {
  const bars = Array.from({ length: 30 }, (_, i) => {
    const baseHeight = 4;
    const maxHeight = 40;
    
    if (isRecording) {
      // Create live waveform that responds to voice input
      const distanceFromCenter = Math.abs(i - 15) / 15;
      const centerBoost = 1 - distanceFromCenter * 0.6;
      
      // Add some randomness for natural look
      const randomFactor = 0.7 + Math.random() * 0.6;
      
      // Calculate height based on audio level
      const intensity = audioLevel * centerBoost * randomFactor;
      const height = baseHeight + (intensity * (maxHeight - baseHeight));
      
      return Math.max(baseHeight, Math.min(maxHeight, height));
    } else {
      // Static waveform pattern for completed recording
      const staticHeights = [
        6, 12, 18, 24, 30, 36, 28, 20, 14, 8, 6, 10, 16, 26, 34,
        38, 32, 24, 18, 12, 8, 14, 22, 30, 26, 20, 14, 10, 8, 6
      ];
      return staticHeights[i] || baseHeight;
    }
  });

  return (
    <div className={cn("flex items-center justify-center gap-1 h-12", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-100 ease-out",
            isRecording 
              ? "bg-white/90" 
              : "bg-[#128C7E]"
          )}
          style={{
            height: `${height}px`,
            transform: isRecording && audioLevel > 0.1 ? `scaleY(${0.8 + audioLevel * 0.4})` : 'scaleY(1)',
            transition: isRecording ? 'height 100ms ease-out, transform 100ms ease-out' : 'height 200ms ease-out'
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
