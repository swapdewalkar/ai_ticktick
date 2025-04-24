// Priority levels
export type Priority = 'low' | 'medium' | 'high';

// Recurring task patterns
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// Subtask type
export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

// List type
export type List = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
};

// Task type
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
  listId: string;
  notes?: string;
  subtasks: Subtask[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringInterval?: number;
  tags?: string[];
  userId: string;
  createdAt: Date;
};

// Pomodoro timer settings
export type PomodoroSettings = {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
};
