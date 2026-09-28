import React from 'react';
import { Bot, User } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
          <Bot className="w-4 h-4 text-indigo-600" />
        </div>
      )}
      
      <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
        isUser 
          ? 'bg-indigo-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
      }`}>
        <p className="whitespace-pre-line">{message.text}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}