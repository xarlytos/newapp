import React, { useState } from 'react';
import { Send, ArrowLeft, MoreVertical, Paperclip, Smile } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isSent: boolean;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hola, ¿cómo estás?", isSent: true, timestamp: new Date(Date.now() - 3600000) },
    { id: 2, text: "¡Muy bien, gracias! ¿Y tú?", isSent: false, timestamp: new Date(Date.now() - 3500000) },
    { id: 3, text: "Bien también. ¿Cómo va tu entrenamiento?", isSent: true, timestamp: new Date(Date.now() - 3400000) },
    { id: 4, text: "Progresando muy bien. He notado mejoras en tu técnica de sentadilla. Sigue así.", isSent: false, timestamp: new Date(Date.now() - 3300000) },
  ]);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      isSent: true,
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simular respuesta del entrenador después de 1 segundo
    setTimeout(() => {
      const response: Message = {
        id: messages.length + 2,
        text: "Gracias por tu mensaje. Te responderé pronto.",
        isSent: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header del chat con diseño mejorado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <button className="mr-3 p-2 rounded-full hover:bg-blue-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
              A
            </div>
            <div>
              <h1 className="text-xl font-semibold">Entrenador Alex</h1>
              <p className="text-xs text-blue-100">En línea ahora</p>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-blue-700 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Área de mensajes con diseño mejorado */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.isSent 
                  ? 'bg-blue-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
              }`}
            >
              <p>{message.text}</p>
              <p 
                className={`text-xs mt-1 text-right ${
                  message.isSent ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Área de entrada de texto con diseño mejorado */}
      <div className="bg-white p-4 flex items-center border-t border-gray-200 shadow-lg">
        <button className="text-gray-500 p-2 rounded-full hover:bg-gray-100 mr-2">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Escribe un mensaje..."
          className="flex-1 border border-gray-300 rounded-full py-3 px-4 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button className="text-gray-500 p-2 rounded-full hover:bg-gray-100 mr-2">
          <Smile size={20} />
        </button>
        <button 
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
          className={`p-3 rounded-full ${
            newMessage.trim() === '' 
              ? 'bg-gray-200 text-gray-400' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } transition-colors`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;