
import React, { useState } from 'react';
import { Send, Plus, Camera, Paperclip } from 'lucide-react';
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
    <div className={cn("p-2 bg-white", className)}>
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <button className="p-3 text-gray-500 hover:text-gray-700 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
        
        {/* Input Container */}
        <div className="flex-1 flex items-end bg-white rounded-full border border-gray-300 shadow-sm">
          <div className="flex-1 flex items-center px-4 py-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="border-0 shadow-none focus-visible:ring-0 text-base bg-transparent"
            />
            
            {/* Attachment Icons */}
            <div className="flex items-center gap-1 ml-2">
              <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Send or Voice Button */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            className="p-3 bg-[#128C7E] hover:bg-[#0F7B6C] text-white rounded-full transition-all duration-200 shadow-lg"
          >
            <Send className="w-6 h-6" />
          </button>
        ) : (
          <VoiceRecorder onSendAudio={onSendAudio} />
        )}
      </div>
    </div>
  );
};

export default ChatInput;
