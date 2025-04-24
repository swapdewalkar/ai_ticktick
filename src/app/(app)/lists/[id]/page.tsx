'use client';

import { useTasks } from '@/contexts/TaskContext';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import { useState } from 'react';

export default function ListPage({ params }: { params: { id: string } }) {
  const { lists, tasks, loading, updateList, deleteList } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  
  const list = lists.find(list => list.id === params.id);
  const listTasks = tasks.filter(task => task.list_id === params.id);
  
  // Handle list name editing
  const handleEditClick = () => {
    if (list) {
      setListName(list.name);
      setIsEditing(true);
    }
  };
  
  const handleSaveClick = async () => {
    if (list && listName.trim()) {
      await updateList(list.id, listName.trim());
      setIsEditing(false);
    }
  };
  
  const handleDeleteList = async () => {
    if (list && window.confirm('Are you sure you want to delete this list and all its tasks?')) {
      await deleteList(list.id);
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium text-gray-700">List not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleSaveClick}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">{list.name}</h1>
        )}
        
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={handleEditClick}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Edit List
              </button>
              <button
                onClick={handleDeleteList}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete List
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Tasks</h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showAddTask ? 'Cancel' : 'Add Task'}
          </button>
        </div>
        
        {showAddTask && (
          <div className="mb-6">
            <AddTaskForm listId={list.id} onComplete={() => setShowAddTask(false)} />
          </div>
        )}
        
        {listTasks.length > 0 ? (
          <TaskList tasks={listTasks} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No tasks in this list. Add a task to get started!
          </div>
        )}
      </div>
    </div>
  );
}
