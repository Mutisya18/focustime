import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

const Timer = ({ 
  timeLeft, 
  isActive, 
  currentSession, 
  progress, 
  onStartPause, 
  onReset, 
  onSkip,
  darkMode 
}) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <div 
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: currentSession.color }}
        >
          {currentSession.name}
        </div>
      </div>
      
      {/* Progress Ring */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={darkMode ? '#374151' : '#e5e7eb'}
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={currentSession.color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-light mb-2">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-500">
              {isActive ? 'Running' : 'Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onStartPause}
          className="flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: currentSession.color }}
        >
          {isActive ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
        </button>
        <button
          onClick={onReset}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={onSkip}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-8 text-xs text-gray-500">
        Space to play/pause • Esc to reset • Ctrl+N new session
      </div>
    </div>
  );
};

export default Timer;
