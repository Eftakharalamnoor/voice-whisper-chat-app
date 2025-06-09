import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Send, X, Trash2, Pause, Play, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import AudioWaveform from './AudioWaveform';
import { Progress } from '@/components/ui/progress';

interface VoiceRecorderProps {
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendAudio, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);

  // Maximum recording duration in seconds (e.g., 60 seconds)
  const maxDuration = 60;
  const progressPercentage = (duration / maxDuration) * 100;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis for real-time waveform
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 0.1;
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 100);
      
      // Start real-time audio level monitoring
      const monitorAudioLevel = () => {
        if (analyserRef.current && isRecording && !isPaused) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate RMS (Root Mean Square) for more accurate volume detection
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const normalizedLevel = Math.min(rms / 128, 1); // Normalize to 0-1
          
          setAudioLevel(normalizedLevel);
        }
        
        if (isRecording) {
          animationRef.current = requestAnimationFrame(monitorAudioLevel);
        }
      };
      
      monitorAudioLevel();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [isRecording, isPaused]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 0.1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 100);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setHasRecording(true);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    setHasRecording(false);
    setDuration(0);
    setAudioLevel(0);
    audioChunksRef.current = [];
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  const sendRecording = useCallback(() => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSendAudio(audioBlob, duration);
      setHasRecording(false);
      setDuration(0);
      setAudioLevel(0);
      audioChunksRef.current = [];
    }
  }, [onSendAudio, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // WhatsApp Recording Interface
  if (isRecording || isPaused) {
    return (
      <div className="fixed inset-0 bg-[#128C7E] z-50 flex flex-col">
        {/* Header with Progress */}
        <div className="p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={cancelRecording}>
                <X className="w-6 h-6" />
              </button>
              <span className="text-lg font-medium">Recording...</span>
            </div>
            <span className="text-lg font-mono">{formatTime(duration)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full">
            <Progress 
              value={Math.min(progressPercentage, 100)} 
              className="h-2 bg-green-600/30"
            />
            <div className="flex justify-between text-xs text-green-200 mt-1">
              <span>0:00</span>
              <span>{formatTime(maxDuration)}</span>
            </div>
          </div>
        </div>
        
        {/* Slide to Cancel */}
        <div className="flex-1 flex flex-col justify-center items-center px-8">
          <div className="text-white text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-lg">Slide to cancel</span>
            </div>
          </div>
          
          {/* Waveform */}
          <div className="w-full max-w-sm">
            <AudioWaveform 
              audioLevel={isPaused ? 0 : audioLevel} 
              isRecording={!isPaused} 
              className="mb-8"
            />
          </div>
        </div>
        
        {/* Bottom Controls */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={cancelRecording}
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="p-6 bg-white text-[#128C7E] rounded-full transition-all duration-200 shadow-lg"
          >
            {isPaused ? (
              <Play className="w-8 h-8 ml-1" />
            ) : (
              <Pause className="w-8 h-8" />
            )}
          </button>
          
          <button
            onClick={stopRecording}
            className="p-4 bg-[#25D366] hover:bg-[#20B558] text-white rounded-full transition-all duration-200 shadow-lg"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Recording Preview
  if (hasRecording) {
    return (
      <div className="flex items-center gap-3 p-3 bg-[#F0F2F5] rounded-2xl border">
        <button
          onClick={cancelRecording}
          className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[#128C7E] font-medium text-sm">{formatTime(duration)}</span>
          <AudioWaveform audioLevel={0} isRecording={false} />
        </div>
        
        <button
          onClick={sendRecording}
          className="p-2 bg-[#128C7E] hover:bg-[#0F7B6C] text-white rounded-full transition-all duration-200 shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Microphone Button
  return (
    <button
      onMouseDown={startRecording}
      onTouchStart={startRecording}
      className={cn(
        "p-3 bg-[#128C7E] hover:bg-[#0F7B6C] text-white rounded-full transition-all duration-200 shadow-lg active:scale-95",
        className
      )}
    >
      <Mic className="w-6 h-6" />
    </button>
  );
};

export default VoiceRecorder;
