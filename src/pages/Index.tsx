
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Phone, Video, MoreVertical } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

interface Message {
  id: string;
  type: 'text' | 'voice';
  content: string;
  audioBlob?: Blob;
  audioDuration?: number;
  isSent: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      content: 'Hey! How are you doing?',
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: '2',
      type: 'text',
      content: 'I\'m doing great! Thanks for asking 😊',
      isSent: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 3)
    },
    {
      id: '3',
      type: 'text',
      content: 'Try the voice recording feature!',
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 1)
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content,
      isSent: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendAudio = (audioBlob: Blob, duration: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'voice',
      content: '',
      audioBlob,
      audioDuration: duration,
      isSent: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* WhatsApp Header */}
      <div className="bg-[#128C7E] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">JD</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">John Doe</h1>
              <p className="text-xs text-green-200">online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-md mx-auto bg-[#ECE5DD] min-h-screen flex flex-col">
        {/* WhatsApp Chat Background Pattern */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        >
          <div className="p-4 space-y-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                type={message.type}
                content={message.content}
                audioBlob={message.audioBlob}
                audioDuration={message.audioDuration}
                isSent={message.isSent}
                timestamp={message.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendAudio={handleSendAudio}
        />
      </div>
    </div>
  );
};

export default Index;
