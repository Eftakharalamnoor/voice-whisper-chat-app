
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
      "flex w-full mb-2",
      isSent ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[85%] rounded-lg p-2 shadow-sm relative",
        isSent 
          ? "bg-[#DCF8C6] text-black ml-12" 
          : "bg-white text-black mr-12"
      )}>
        {/* WhatsApp message tail */}
        <div className={cn(
          "absolute top-0 w-0 h-0",
          isSent 
            ? "right-[-8px] border-l-[8px] border-l-[#DCF8C6] border-t-[8px] border-t-transparent" 
            : "left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent"
        )} />
        
        {type === 'text' ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          audioBlob && audioDuration && (
            <AudioPlayer 
              audioBlob={audioBlob} 
              duration={audioDuration}
              className="bg-transparent border-0 shadow-none p-0"
            />
          )
        )}
        
        <div className={cn(
          "text-xs mt-1 opacity-70 text-right",
          "text-gray-500"
        )}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
