import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, Menu, X, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, chatOpen, setChatOpen } = useApp();

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between relative z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Satellite className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">WebGIS AI</h1>
            <p className="text-xs text-slate-400">Satellite Intelligence Platform</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-2 rounded-lg transition-all ${
            chatOpen 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-slate-400" />
            <span className="text-white font-medium">{user?.name}</span>
          </div>
          
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};