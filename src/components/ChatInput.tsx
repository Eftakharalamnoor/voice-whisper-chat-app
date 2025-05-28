
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VoiceRecorder from './VoiceRecorder';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendAudio, className }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex items-center gap-3 p-4 bg-white border-t", className)}>
      <div className="flex-1 flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 rounded-full border-gray-300 focus:border-emerald-500"
        />
        
        {message.trim() ? (
          <button
            onClick={handleSend}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-200 hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <VoiceRecorder onSendAudio={onSendAudio} />
        )}
      </div>
    </div>
  );
};

export default ChatInput;
