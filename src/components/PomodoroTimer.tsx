'use client';

import { useState } from 'react';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { FiPlay, FiPause, FiRefreshCw, FiSkipForward, FiSettings } from 'react-icons/fi';
import { PomodoroSettings } from '@/types/types';

export default function PomodoroTimer() {
  const {
    isRunning,
    isPaused,
    isWorkSession,
    currentSession,
    settings,
    minutes,
    seconds,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipSession,
    updateSettings
  } = usePomodoroContext();

  const [showSettings, setShowSettings] = useState(false);
  const [newSettings, setNewSettings] = useState<PomodoroSettings>(settings);

  // Format time as MM:SS
  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle settings form submission
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(newSettings);
    setShowSettings(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Pomodoro Timer</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title="Settings"
        >
          <FiSettings className="h-5 w-5" />
        </button>
      </div>
      
      {showSettings ? (
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Timer Settings</h3>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Session (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={newSettings.workMinutes}
                onChange={(e) => setNewSettings({...newSettings, workMinutes: parseInt(e.target.value) || 25})}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={newSettings.breakMinutes}
                onChange={(e) => setNewSettings({...newSettings, breakMinutes: parseInt(e.target.value) || 5})}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={newSettings.longBreakMinutes}
                onChange={(e) => setNewSettings({...newSettings, longBreakMinutes: parseInt(e.target.value) || 15})}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sessions Before Long Break
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={newSettings.sessionsBeforeLongBreak}
                onChange={(e) => setNewSettings({...newSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4})}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {isWorkSession ? 'Work Session' : 'Break'} • Session {currentSession}
            </div>
            <div className="text-5xl font-bold mb-2 text-gray-800 dark:text-white">
              {formatTime(minutes, seconds)}
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isWorkSession ? 'bg-indigo-600' : 'bg-green-500'} transition-all duration-1000 ease-linear`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            {!isRunning && !isPaused && (
              <button
                onClick={startTimer}
                className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Start"
              >
                <FiPlay className="h-6 w-6" />
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={pauseTimer}
                className="p-3 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                title="Pause"
              >
                <FiPause className="h-6 w-6" />
              </button>
            )}
            
            {isPaused && (
              <button
                onClick={resumeTimer}
                className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Resume"
              >
                <FiPlay className="h-6 w-6" />
              </button>
            )}
            
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Reset"
            >
              <FiRefreshCw className="h-6 w-6" />
            </button>
            
            <button
              onClick={skipSession}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Skip"
            >
              <FiSkipForward className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>
              {isWorkSession 
                ? 'Focus on your task until the timer ends.' 
                : 'Take a break and relax.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
