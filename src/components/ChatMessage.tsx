
import React from 'react';
import { cn } from '@/lib/utils';
import AudioPlayer from './AudioPlayer';

interface ChatMessageProps {
  type: 'text' | 'voice';
  content: string;
  audioBlob?: Blob;
  audioDuration?: number;
  isSent: boolean;
  timestamp: Date;
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  audioBlob,
  audioDuration,
  isSent,
  timestamp,
  className
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "flex w-full mb-4",
      isSent ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl p-3",
        isSent 
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ml-12" 
          : "bg-white shadow-sm border mr-12"
      )}>
        {type === 'text' ? (
          <p className="text-sm">{content}</p>
        ) : (
          audioBlob && audioDuration && (
            <AudioPlayer 
              audioBlob={audioBlob} 
              duration={audioDuration}
              className={cn(
                "bg-transparent border-0 shadow-none",
                isSent && "text-white"
              )}
            />
          )
        )}
        
        <div className={cn(
          "text-xs mt-2 opacity-70",
          isSent ? "text-emerald-100" : "text-gray-500"
        )}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
