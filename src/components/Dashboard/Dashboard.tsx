import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../Layout/Header';
import { Sidebar } from '../Layout/Sidebar';
import { ChatBot } from '../Chat/ChatBot';
import { MapView } from '../Map/MapView';
import { VideoPlayer } from '../Video/VideoPlayer';
import { useApp } from '../../contexts/AppContext';

export const Dashboard: React.FC = () => {
  const { sidebarOpen, chatOpen, setChatOpen } = useApp();

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-80' : 'ml-0'
        } ${chatOpen ? 'mr-96' : 'mr-0'}`}>
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to WebGIS AI Platform
              </h2>
              <p className="text-slate-300 mb-4">
                Transform satellite imagery into smooth, AI-enhanced videos using advanced frame interpolation
              </p>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                  Create New Project
                </button>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
                  Browse Datasets
                </button>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Interactive Map</h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <MapView />
                </div>
                <p className="text-slate-400 text-sm mt-4">
                  Select regions, view WMS layers, and define areas for video generation
                </p>
              </motion.div>

              {/* Video Player Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Video Preview</h3>
                <VideoPlayer />
              </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {[
                { title: 'Active Projects', value: '12', color: 'blue' },
                { title: 'Generated Videos', value: '47', color: 'green' },
                { title: 'Processing Queue', value: '3', color: 'yellow' },
                { title: 'GPU Utilization', value: '78%', color: 'purple' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700"
                >
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                  <p className={`text-2xl font-bold ${
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'yellow' ? 'text-yellow-400' :
                    'text-purple-400'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </main>

        <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
};