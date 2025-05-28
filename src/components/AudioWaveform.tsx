
import React from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioLevel, isRecording, className }) => {
  const bars = Array.from({ length: 40 }, (_, i) => {
    const baseHeight = 3;
    const maxHeight = 30;
    
    if (isRecording) {
      // Create live waveform that responds to voice input
      const distanceFromCenter = Math.abs(i - 20) / 20; // Distance from center (0-1)
      const centerBoost = 1 - distanceFromCenter * 0.7; // Boost center bars more
      
      // Add some randomness for natural look
      const randomFactor = 0.6 + Math.random() * 0.8;
      
      // Calculate height based on audio level
      const intensity = audioLevel * centerBoost * randomFactor;
      const height = baseHeight + (intensity * (maxHeight - baseHeight));
      
      return Math.max(baseHeight, Math.min(maxHeight, height));
    } else {
      // Static waveform for completed recording with varied heights
      const staticHeights = [
        4, 8, 12, 16, 20, 24, 28, 20, 16, 12, 8, 6, 10, 18, 26, 
        30, 24, 18, 14, 10, 8, 12, 20, 24, 18, 16, 12, 8, 6, 4,
        6, 10, 14, 18, 22, 16, 12, 8, 6, 4
      ];
      return staticHeights[i] || baseHeight;
    }
  });

  return (
    <div className={cn("flex items-center justify-center gap-1 h-8", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-100 ease-out",
            isRecording 
              ? "bg-gray-400" 
              : "bg-gray-300"
          )}
          style={{
            height: `${height}px`,
            transform: isRecording && audioLevel > 0.1 ? `scaleY(${0.7 + audioLevel * 0.6})` : 'scaleY(1)',
            transition: isRecording ? 'height 100ms ease-out, transform 100ms ease-out' : 'height 200ms ease-out'
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
