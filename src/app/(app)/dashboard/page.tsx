'use client';

import { useTasks } from '@/contexts/TaskContext';
import TaskList from '@/components/TaskList';
import { useState } from 'react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { tasks, loading } = useTasks();
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    
    if (!task.due_date) return false;
    
    const dueDate = new Date(task.due_date);
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1 rounded-md ${
              filter === 'today' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-md ${
              filter === 'upcoming' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">
          {filter === 'all' && 'All Tasks'}
          {filter === 'today' && `Today's Tasks (${format(today, 'MMM d, yyyy')})`}
          {filter === 'upcoming' && 'Upcoming Tasks'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <TaskList tasks={filteredTasks} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No tasks found. Create a new task to get started!
          </div>
        )}
      </div>
    </div>
  );
}
