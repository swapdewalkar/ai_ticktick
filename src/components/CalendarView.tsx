'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/types';
import { FiCheckCircle, FiCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function CalendarView() {
  const { tasks, toggleTaskCompletion } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);

  // Function to check if a date has tasks
  const hasTasks = (date: Date) => {
    return tasks.some(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get tasks for the selected date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Toggle task expanded state
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Render task list for selected date
  const renderTaskList = () => {
    const tasksForDate = getTasksForDate(selectedDate);
    
    if (tasksForDate.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No tasks scheduled for this date.
        </div>
      );
    }
    
    return (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasksForDate.map(task => (
          <li key={task.id} className="py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.completed ? (
                    <FiCheckCircle className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <FiCircle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className={task.completed ? 'line-through text-gray-500' : ''}>
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="mt-1 flex items-center space-x-3 text-xs">
                    <span className={`flex items-center ${getPriorityColor(task.priority)}`}>
                      Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    {task.isRecurring && (
                      <span className="text-indigo-500">
                        Recurring: {task.recurringPattern}
                      </span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => toggleTaskExpanded(task.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expandedTaskIds.includes(task.id) ? (
                  <FiChevronUp className="h-5 w-5" />
                ) : (
                  <FiChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Expanded content */}
            {expandedTaskIds.includes(task.id) && (
              <div className="mt-3 pl-8">
                {task.notes && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {task.notes}
                    </p>
                  </div>
                )}
                
                {task.subtasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtasks:</h4>
                    <ul className="mt-1 space-y-1">
                      {task.subtasks.map(subtask => (
                        <li key={subtask.id} className="flex items-center">
                          <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                            • {subtask.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Calendar View</h2>
      </div>
      
      <div className="md:flex">
        <div className="md:w-1/2 p-4 calendar-container">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date, view }) => 
              view === 'month' && hasTasks(date) ? 'has-tasks' : null
            }
            className="w-full rounded-lg border-none"
          />
        </div>
        
        <div className="md:w-1/2 p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
            Tasks for {formatDate(selectedDate)}
          </h3>
          {renderTaskList()}
        </div>
      </div>
      
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          background-color: transparent;
          border: none;
          font-family: inherit;
        }
        
        .react-calendar__tile--active {
          background: #4f46e5;
          color: white;
        }
        
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: #4338ca;
        }
        
        .react-calendar__tile.has-tasks {
          position: relative;
        }
        
        .react-calendar__tile.has-tasks::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #4f46e5;
        }
        
        .dark .react-calendar {
          color: #e5e7eb;
        }
        
        .dark .react-calendar__tile:enabled:hover,
        .dark .react-calendar__tile:enabled:focus {
          background-color: #374151;
        }
        
        .dark .react-calendar__month-view__days__day--weekend {
          color: #f87171;
        }
        
        .dark .react-calendar__tile--now {
          background: #1f2937;
        }
        
        .dark .react-calendar__tile--active {
          background: #4f46e5;
          color: white;
        }
        
        .dark .react-calendar__tile--active:enabled:hover,
        .dark .react-calendar__tile--active:enabled:focus {
          background: #4338ca;
        }
        
        .dark .react-calendar__month-view__weekdays__weekday {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
