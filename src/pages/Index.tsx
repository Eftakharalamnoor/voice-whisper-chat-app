
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
      content: 'Try out the voice recording feature below!',
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">John Doe</h1>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col shadow-xl">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
          <div className="space-y-1">
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

      {/* Demo Instructions */}
      <div className="max-w-md mx-auto p-4">
        <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">Voice Recording Demo</h3>
          </div>
          <p className="text-sm text-emerald-800">
            Click and hold the microphone button to record a voice message, just like WhatsApp! 
            You can also type text messages normally.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
