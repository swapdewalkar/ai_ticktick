'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiCircle, FiPlus, FiTrash2, FiCalendar, FiList, FiFlag, FiInbox, FiStar } from 'react-icons/fi';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

// Define types
type Priority = 'low' | 'medium' | 'high';

type List = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
  listId: string;
};

export default function Home() {
  // Define lists
  const [lists, setLists] = useState<List[]>([
    { id: 'inbox', name: 'Inbox', icon: <FiInbox className="h-5 w-5" /> },
    { id: 'work', name: 'Work', icon: <FiStar className="h-5 w-5" /> },
    { id: 'personal', name: 'Personal', icon: <FiList className="h-5 w-5" /> },
  ]);

  // Define tasks with priorities and list assignments
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project proposal',
      completed: false,
      dueDate: new Date(Date.now() + 86400000),
      priority: 'high',
      listId: 'work'
    },
    {
      id: '2',
      title: 'Buy groceries',
      completed: false,
      dueDate: new Date(),
      priority: 'medium',
      listId: 'personal'
    },
    {
      id: '3',
      title: 'Schedule dentist appointment',
      completed: false,
      dueDate: new Date(Date.now() + 172800000),
      priority: 'low',
      listId: 'personal'
    },
    {
      id: '4',
      title: 'Review pull requests',
      completed: true,
      dueDate: new Date(),
      priority: 'medium',
      listId: 'work'
    },
    {
      id: '5',
      title: 'Respond to emails',
      completed: false,
      priority: 'high',
      listId: 'inbox'
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState('inbox');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get filtered tasks based on selected list and search query
  const filteredTasks = tasks
    .filter(task => selectedListId === 'all' || task.listId === selectedListId)
    .filter(task => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (lists.find(list => list.id === task.listId)?.name.toLowerCase().includes(query))
      );
    });

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: newTaskTitle.trim(),
          completed: false,
          dueDate: selectedDueDate,
          priority: selectedPriority,
          listId: selectedListId,
        },
      ]);
      // Reset form
      setNewTaskTitle('');
      setSelectedDueDate(null);
      setSelectedPriority('medium');
    }
  };

  const resetForm = () => {
    setNewTaskTitle('');
    setSelectedDueDate(null);
    setSelectedPriority('medium');
  };

  const addList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        icon: <FiList className="h-5 w-5" />,
      };
      setLists([...lists, newList]);
      setNewListName('');
      setIsAddingList(false);
    }
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: Priority) => {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TickTick Clone</h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Lists</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedListId('all')}
                  className={`w-full flex items-center px-3 py-2 rounded-md ${
                    selectedListId === 'all' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiList className="mr-2 h-5 w-5" />
                  All Tasks
                </button>
              </li>
              {lists.map(list => (
                <li key={list.id}>
                  <button
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md ${
                      selectedListId === list.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {list.icon}
                    <span className="ml-2">{list.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            {isAddingList ? (
              <div className="mt-2 p-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name"
                  className="w-full px-3 py-2 border rounded-md mb-2"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addList}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListName('');
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="mt-2 flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <FiPlus className="mr-1" /> Add List
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      List
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {lists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <DatePicker
                      selected={selectedDueDate}
                      onChange={(date) => setSelectedDueDate(date)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholderText="Select a date"
                      dateFormat="MMM d, yyyy"
                      isClearable
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addTask}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add Task
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedListId === 'all' ? 'All Tasks' : lists.find(list => list.id === selectedListId)?.name || 'Tasks'}
              </h2>
              <ul className="divide-y divide-gray-200">
                {filteredTasks.map(task => (
                  <li key={task.id} className="py-4 flex items-start justify-between">
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
                          {task.dueDate && (
                            <span className="text-gray-500 flex items-center">
                              <FiCalendar className="mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          <span className={`flex items-center ${getPriorityColor(task.priority)}`}>
                            <FiFlag className="mr-1" />
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          <span className="text-gray-500">
                            {lists.find(list => list.id === task.listId)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </li>
                ))}
                {filteredTasks.length === 0 && (
                  <li className="py-4 text-center text-gray-500">
                    No tasks in this list. Add a task to get started!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white p-4 text-center text-gray-500 text-sm border-t">
        <p>TickTick Clone - A simple task management application</p>
      </footer>
    </div>
  );
}
