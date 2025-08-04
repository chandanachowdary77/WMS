import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Download,
  Settings
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title = 'AI Generated Satellite Video',
  onTimeUpdate 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      onTimeUpdate?.(current, total);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
      {/* Video Display */}
      <div className="relative aspect-video bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-400">No video loaded</p>
              <p className="text-slate-500 text-sm">Generate a video from satellite data</p>
            </div>
          </div>
        )}
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </motion.button>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">AI-enhanced satellite imagery • RIFE interpolation</p>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:bg-slate-700 rounded-lg transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-white transition-all"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-slate-700 rounded-lg appearance-none slider"
              />
            </div>

            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <Settings className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <Download className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};