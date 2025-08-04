import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  Video, 
  Database, 
  Settings, 
  ChevronRight,
  Satellite,
  Play,
  Download,
  Calendar
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [activeTab, setActiveTab] = useState('datasets');
  const { wmsServices, videoProjects } = useApp();

  const tabs = [
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'projects', label: 'Video Projects', icon: Video },
    { id: 'map', label: 'Map Tools', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 z-40 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 p-3 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="hidden sm:block">{tab.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'datasets' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Available Datasets</h3>
                  {wmsServices.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Satellite className="w-5 h-5 text-blue-400" />
                          <h4 className="text-white font-medium">{service.name}</h4>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          service.provider === 'BHUVAN' ? 'bg-green-500/20 text-green-400' :
                          service.provider === 'VEDAS' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {service.provider}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {service.layers.length} layers available
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Video Projects</h3>
                  {videoProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No video projects yet</p>
                      <p className="text-slate-500 text-sm">Create your first AI-generated video</p>
                    </div>
                  ) : (
                    videoProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            project.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">
                          {project.interpolationSettings.model} • {project.interpolationSettings.frameRate}fps
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{project.createdAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex space-x-1">
                            {project.status === 'completed' && (
                              <>
                                <button className="p-1 text-green-400 hover:bg-green-500/20 rounded">
                                  <Play className="w-3 h-3" />
                                </button>
                                <button className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                                  <Download className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'map' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Map Tools</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Draw Box', icon: '📦' },
                      { name: 'Measure', icon: '📏' },
                      { name: 'Zoom In', icon: '🔍' },
                      { name: 'Reset View', icon: '🔄' }
                    ].map((tool) => (
                      <button
                        key={tool.name}
                        className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition-all text-center"
                      >
                        <div className="text-2xl mb-1">{tool.icon}</div>
                        <div className="text-xs text-slate-300">{tool.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'GPU Acceleration', enabled: true },
                      { label: 'Auto-save Projects', enabled: true },
                      { label: 'High Quality Preview', enabled: false },
                      { label: 'Notifications', enabled: true }
                    ].map((setting) => (
                      <div key={setting.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{setting.label}</span>
                        <button
                          className={`w-11 h-6 rounded-full transition-all ${
                            setting.enabled ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              setting.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};