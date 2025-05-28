
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Send, X, Trash2, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import AudioWaveform from './AudioWaveform';

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
        setDuration(prev => prev + 0.1);
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
        setDuration(prev => prev + 0.1);
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

  if (isRecording || isPaused) {
    return (
      <div className={cn("flex items-center gap-4 p-4 bg-white rounded-3xl shadow-lg border", className)}>
        <button
          onClick={cancelRecording}
          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all duration-200"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        
        <div className="flex-1 flex items-center gap-4">
          <span className="text-lg font-mono text-gray-800 min-w-[60px]">{formatTime(duration)}</span>
          
          <AudioWaveform 
            audioLevel={isPaused ? 0 : audioLevel} 
            isRecording={!isPaused} 
            className="flex-1"
          />
        </div>
        
        <button
          onClick={isPaused ? resumeRecording : pauseRecording}
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200"
        >
          {isPaused ? (
            <Play className="w-5 h-5 ml-0.5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
        </button>
        
        <button
          onClick={stopRecording}
          className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (hasRecording) {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200", className)}>
        <button
          onClick={cancelRecording}
          className="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-all duration-200 hover:scale-105"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <span className="text-emerald-700 font-medium">{formatTime(duration)}</span>
          <AudioWaveform audioLevel={0} isRecording={false} />
        </div>
        
        <button
          onClick={sendRecording}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onMouseDown={startRecording}
      onTouchStart={startRecording}
      className={cn(
        "p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full transition-all duration-200 hover:scale-105 shadow-lg active:scale-95",
        className
      )}
    >
      <Mic className="w-6 h-6" />
    </button>
  );
};

export default VoiceRecorder;
