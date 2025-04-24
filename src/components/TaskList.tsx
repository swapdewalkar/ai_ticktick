'use client';

import { Task } from '@/types/database.types';
import { useTasks } from '@/contexts/TaskContext';
import { format } from 'date-fns';
import { FiCheckCircle, FiCircle, FiFlag, FiTrash2, FiEdit } from 'react-icons/fi';
import { useState } from 'react';
import TaskEditForm from './TaskEditForm';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { updateTask, deleteTask } = useTasks();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleToggleComplete = async (task: Task) => {
    await updateTask(task.id, { completed: !task.completed });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <ul className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <li key={task.id} className="py-4">
          {editingTaskId === task.id ? (
            <TaskEditForm
              task={task}
              onCancel={() => setEditingTaskId(null)}
              onComplete={() => setEditingTaskId(null)}
            />
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.completed ? (
                    <FiCheckCircle className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <FiCircle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                  <h3 className="text-sm font-medium">{task.title}</h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                  )}
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                    {task.due_date && (
                      <span>
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {task.priority && (
                      <span className="flex items-center">
                        <FiFlag className={`mr-1 ${getPriorityColor(task.priority)}`} />
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTaskId(task.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
