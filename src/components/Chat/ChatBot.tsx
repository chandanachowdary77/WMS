import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  X, 
  Sparkles,
  MapPin,
  Video,
  Database
} from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your WebGIS AI assistant. I can help you select datasets, create videos, and navigate the platform. What would you like to do today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('dataset') || lowerInput.includes('data')) {
      return 'I can help you find the perfect dataset! We have BHUVAN for high-resolution imagery, VEDAS for agricultural data, and MOSDAC for ocean monitoring. Which type of analysis are you planning?';
    }
    
    if (lowerInput.includes('video') || lowerInput.includes('animation')) {
      return 'Great! I can guide you through creating AI-enhanced videos. The process involves selecting a time series dataset, choosing interpolation settings (I recommend RIFE for best quality), and generating smooth animations. Would you like to start with dataset selection?';
    }
    
    if (lowerInput.includes('map') || lowerInput.includes('location')) {
      return 'The interactive map supports WMS layers, bounding box selection, and real-time data visualization. You can draw areas of interest, measure distances, and overlay multiple datasets. Need help with a specific map function?';
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return 'I\'m here to help! You can ask me about:\n• Finding and selecting datasets\n• Creating video projects\n• Using map tools\n• Understanding AI processing options\n• Troubleshooting issues\n\nWhat specific topic interests you?';
    }
    
    return 'That\'s an interesting question! I can help you with dataset selection, video generation, map navigation, and technical guidance. Could you provide more details about what you\'d like to accomplish?';
  };

  const quickActions = [
    { text: 'Show available datasets', icon: Database },
    { text: 'Create a new video project', icon: Video },
    { text: 'Help with map tools', icon: MapPin },
    { text: 'AI processing options', icon: Sparkles }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700 z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="w-4 h-4 text-white" /> : 
                      <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-slate-700 space-y-2">
            <p className="text-xs text-slate-400 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setInputValue(action.text)}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-left flex items-center space-x-2"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="truncate">{action.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-all"
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};