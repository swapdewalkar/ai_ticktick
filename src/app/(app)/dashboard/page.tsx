'use client';

import { useTaskContext } from '@/contexts/TaskContext';
import { useState } from 'react';
import { format } from 'date-fns';
import CalendarView from '@/components/CalendarView';
import PomodoroTimer from '@/components/PomodoroTimer';
import { FiCalendar, FiClock, FiList } from 'react-icons/fi';

export default function Dashboard() {
  const { tasks, loading, toggleTaskCompletion } = useTaskContext();
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'pomodoro'>('tasks');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;

    if (!task.dueDate) return false;

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (filter === 'today') {
      return dueDate.getTime() === today.getTime();
    }

    if (filter === 'upcoming') {
      return dueDate.getTime() > today.getTime();
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

        {/* Tab navigation */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 rounded-md flex items-center ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FiList className="mr-2" />
            <span className="hidden sm:inline">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-2 rounded-md flex items-center ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FiCalendar className="mr-2" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-3 py-2 rounded-md flex items-center ${
              activeTab === 'pomodoro'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FiClock className="mr-2" />
            <span className="hidden sm:inline">Pomodoro</span>
          </button>
        </div>
      </div>

      {/* Task view */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Task List</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'today'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'upcoming'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              {filter === 'all' && 'All Tasks'}
              {filter === 'today' && `Today's Tasks (${format(today, 'MMM d, yyyy')})`}
              {filter === 'upcoming' && 'Upcoming Tasks'}
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map(task => (
                  <li key={task.id} className="py-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className={task.completed ? 'line-through text-gray-500' : ''}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tasks found. Create a new task to get started!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar view */}
      {activeTab === 'calendar' && (
        <CalendarView />
      )}

      {/* Pomodoro timer */}
      {activeTab === 'pomodoro' && (
        <PomodoroTimer />
      )}
    </div>
  );
}
