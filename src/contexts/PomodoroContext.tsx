'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import { PomodoroSettings } from '@/types/types';

interface PomodoroContextType {
  isRunning: boolean;
  isPaused: boolean;
  isWorkSession: boolean;
  currentSession: number;
  settings: PomodoroSettings;
  minutes: number;
  seconds: number;
  progress: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  updateSettings: (newSettings: PomodoroSettings) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function usePomodoroContext() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4
};

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // Load settings from localStorage
  const loadSettings = (): PomodoroSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (err) {
        console.error('Error parsing Pomodoro settings:', err);
      }
    }
    return DEFAULT_SETTINGS;
  };

  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [currentSession, setCurrentSession] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(settings.workMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize timer
  const getExpiryTimestamp = () => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + totalSeconds);
    return time;
  };

  const {
    totalSeconds: timerTotalSeconds,
    seconds,
    minutes,
    isRunning,
    pause,
    resume,
    restart
  } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: handleTimerComplete,
    autoStart: false
  });

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    setTotalSeconds(loadedSettings.workMinutes * 60);
    
    // Reset timer with loaded settings
    const time = new Date();
    time.setSeconds(time.getSeconds() + loadedSettings.workMinutes * 60);
    restart(time, false);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  // Track elapsed seconds for progress calculation
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Calculate progress percentage
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  function handleTimerComplete() {
    // Play sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.error('Error playing sound:', err));
    
    // Show notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isWorkSession ? 'Break Time!' : 'Work Time!', {
        body: isWorkSession ? 'Take a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      });
    }
    
    // Toggle between work and break sessions
    if (isWorkSession) {
      // Work session completed, start break
      const isLongBreak = currentSession % settings.sessionsBeforeLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreakMinutes : settings.breakMinutes;
      
      setIsWorkSession(false);
      setTotalSeconds(breakDuration * 60);
      setElapsedSeconds(0);
      
      const time = new Date();
      time.setSeconds(time.getSeconds() + breakDuration * 60);
      restart(time, true);
    } else {
      // Break session completed, start work
      setIsWorkSession(true);
      setCurrentSession(prev => prev + 1);
      setTotalSeconds(settings.workMinutes * 60);
      setElapsedSeconds(0);
      
      const time = new Date();
      time.setSeconds(time.getSeconds() + settings.workMinutes * 60);
      restart(time, true);
    }
  }

  const startTimer = () => {
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    setElapsedSeconds(0);
    resume();
  };

  const pauseTimer = () => {
    pause();
  };

  const resumeTimer = () => {
    resume();
  };

  const resetTimer = () => {
    setIsWorkSession(true);
    setCurrentSession(1);
    setTotalSeconds(settings.workMinutes * 60);
    setElapsedSeconds(0);
    
    const time = new Date();
    time.setSeconds(time.getSeconds() + settings.workMinutes * 60);
    restart(time, false);
  };

  const skipSession = () => {
    handleTimerComplete();
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    
    // Update current timer if needed
    const newDuration = isWorkSession 
      ? newSettings.workMinutes 
      : (currentSession % newSettings.sessionsBeforeLongBreak === 0 
          ? newSettings.longBreakMinutes 
          : newSettings.breakMinutes);
    
    setTotalSeconds(newDuration * 60);
    
    // Restart timer with new duration
    const time = new Date();
    time.setSeconds(time.getSeconds() + newDuration * 60);
    restart(time, false);
  };

  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        isPaused: !isRunning,
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
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}
