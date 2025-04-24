'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import { useState, useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <TaskProvider>
        <PomodoroProvider>
          {children}
        </PomodoroProvider>
      </TaskProvider>
    </AuthProvider>
  );
}
