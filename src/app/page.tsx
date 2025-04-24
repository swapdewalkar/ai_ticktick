'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiCircle, FiPlus, FiTrash2, FiCalendar, FiList, FiFlag, FiInbox, FiStar, FiMoon, FiSun, FiRepeat, FiTag, FiEdit, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import TextareaAutosize from 'react-textarea-autosize';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Define types
type Priority = 'low' | 'medium' | 'high';

// Recurring task patterns
type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// Subtask type
type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

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
  notes?: string;
  subtasks: Subtask[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringInterval?: number; // e.g., every 2 days, every 3 weeks
  tags?: string[];
};

export default function Home() {
  // Define dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Define default lists
  const defaultLists: List[] = [
    { id: 'inbox', name: 'Inbox', icon: <FiInbox className="h-5 w-5" /> },
    { id: 'work', name: 'Work', icon: <FiStar className="h-5 w-5" /> },
    { id: 'personal', name: 'Personal', icon: <FiList className="h-5 w-5" /> },
  ];

  // Define default tasks
  const defaultTasks: Task[] = [
    {
      id: '1',
      title: 'Complete project proposal',
      completed: false,
      dueDate: new Date(Date.now() + 86400000),
      priority: 'high',
      listId: 'work',
      notes: 'Include budget estimates and timeline',
      subtasks: [
        { id: '1-1', title: 'Research competitors', completed: true },
        { id: '1-2', title: 'Draft executive summary', completed: false },
        { id: '1-3', title: 'Create presentation slides', completed: false }
      ],
      isRecurring: false,
      tags: ['work', 'project']
    },
    {
      id: '2',
      title: 'Buy groceries',
      completed: false,
      dueDate: new Date(),
      priority: 'medium',
      listId: 'personal',
      notes: 'Check for coupons before going',
      subtasks: [
        { id: '2-1', title: 'Milk and eggs', completed: false },
        { id: '2-2', title: 'Bread', completed: false },
        { id: '2-3', title: 'Vegetables', completed: false }
      ],
      isRecurring: true,
      recurringPattern: 'weekly',
      recurringInterval: 1,
      tags: ['shopping', 'home']
    },
    {
      id: '3',
      title: 'Schedule dentist appointment',
      completed: false,
      dueDate: new Date(Date.now() + 172800000),
      priority: 'low',
      listId: 'personal',
      notes: 'Ask about teeth whitening options',
      subtasks: [],
      isRecurring: true,
      recurringPattern: 'monthly',
      recurringInterval: 6,
      tags: ['health']
    },
    {
      id: '4',
      title: 'Review pull requests',
      completed: true,
      dueDate: new Date(),
      priority: 'medium',
      listId: 'work',
      notes: 'Focus on the API changes first',
      subtasks: [
        { id: '4-1', title: 'Review authentication changes', completed: true },
        { id: '4-2', title: 'Test new endpoints', completed: true }
      ],
      isRecurring: false,
      tags: ['work', 'coding']
    },
    {
      id: '5',
      title: 'Respond to emails',
      completed: false,
      priority: 'high',
      listId: 'inbox',
      notes: 'Prioritize client inquiries',
      subtasks: [],
      isRecurring: true,
      recurringPattern: 'daily',
      recurringInterval: 1,
      tags: ['communication']
    },
  ];

  // Initialize state
  const [lists, setLists] = useState<List[]>(defaultLists);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState('inbox');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Task editing states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskNotes, setEditTaskNotes] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<Priority>('medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState<Date | null>(null);
  const [editTaskListId, setEditTaskListId] = useState('');
  const [editTaskIsRecurring, setEditTaskIsRecurring] = useState(false);
  const [editTaskRecurringPattern, setEditTaskRecurringPattern] = useState<RecurringPattern>('daily');
  const [editTaskRecurringInterval, setEditTaskRecurringInterval] = useState(1);
  const [editTaskTags, setEditTaskTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Subtask states
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);

  // Sorting and filtering
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null); // null = show all, true = completed only, false = incomplete only
  const [filterRecurring, setFilterRecurring] = useState<boolean | null>(null); // null = show all, true = recurring only, false = non-recurring only
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Load lists
    const savedLists = localStorage.getItem('lists');
    if (savedLists) {
      try {
        // Parse the JSON string
        const parsedLists = JSON.parse(savedLists);

        // Restore the React elements for icons
        const listsWithIcons = parsedLists.map((list: any) => {
          let icon;
          if (list.id === 'inbox') {
            icon = <FiInbox className="h-5 w-5" />;
          } else if (list.id === 'work') {
            icon = <FiStar className="h-5 w-5" />;
          } else {
            icon = <FiList className="h-5 w-5" />;
          }
          return { ...list, icon };
        });

        setLists(listsWithIcons);
      } catch (error) {
        console.error('Error parsing lists from localStorage:', error);
      }
    }

    // Load tasks
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);

        // Convert date strings back to Date objects
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));

        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever tasks or lists change
  useEffect(() => {
    // Save lists (without React elements)
    const listsForStorage = lists.map(list => ({
      id: list.id,
      name: list.name,
      // Don't save the icon React element
    }));
    localStorage.setItem('lists', JSON.stringify(listsForStorage));

    // Save tasks (convert Date objects to strings)
    const tasksForStorage = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined
    }));
    localStorage.setItem('tasks', JSON.stringify(tasksForStorage));
  }, [tasks, lists]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));

    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])));

  // Get filtered and sorted tasks
  const filteredTasks = tasks
    // Filter by list
    .filter(task => selectedListId === 'all' || task.listId === selectedListId)
    // Filter by search query
    .filter(task => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.notes && task.notes.toLowerCase().includes(query)) ||
        (lists.find(list => list.id === task.listId)?.name.toLowerCase().includes(query)) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (task.subtasks && task.subtasks.some(subtask => subtask.title.toLowerCase().includes(query)))
      );
    })
    // Filter by completion status
    .filter(task => {
      if (filterCompleted === null) return true;
      return task.completed === filterCompleted;
    })
    // Filter by recurring status
    .filter(task => {
      if (filterRecurring === null) return true;
      return task.isRecurring === filterRecurring;
    })
    // Filter by tags
    .filter(task => {
      if (filterTags.length === 0) return true;
      return task.tags && filterTags.every(tag => task.tags!.includes(tag));
    })
    // Sort tasks
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Handle tasks without due dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
        if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;

        return sortDirection === 'asc'
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime();
      }

      if (sortBy === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        const aValue = priorityValues[a.priority];
        const bValue = priorityValues[b.priority];

        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (sortBy === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      return 0;
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
          notes: '',
          subtasks: [],
          isRecurring: false,
          tags: [],
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

  // Task management functions
  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Subtask management functions
  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              )
            }
          : task
      )
    );
  };

  const addSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;

    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                {
                  id: `${taskId}-${Date.now()}`,
                  title: newSubtaskTitle.trim(),
                  completed: false
                }
              ]
            }
          : task
      )
    );

    setNewSubtaskTitle('');
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
            }
          : task
      )
    );
  };

  // Task expansion toggle
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Task editing functions
  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskNotes(task.notes || '');
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate || null);
    setEditTaskListId(task.listId);
    setEditTaskIsRecurring(task.isRecurring);
    setEditTaskRecurringPattern(task.recurringPattern || 'daily');
    setEditTaskRecurringInterval(task.recurringInterval || 1);
    setEditTaskTags(task.tags || []);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
  };

  const saveEditedTask = () => {
    if (!editingTaskId || !editTaskTitle.trim()) return;

    setTasks(
      tasks.map(task =>
        task.id === editingTaskId
          ? {
              ...task,
              title: editTaskTitle.trim(),
              notes: editTaskNotes.trim(),
              priority: editTaskPriority,
              dueDate: editTaskDueDate,
              listId: editTaskListId,
              isRecurring: editTaskIsRecurring,
              recurringPattern: editTaskIsRecurring ? editTaskRecurringPattern : undefined,
              recurringInterval: editTaskIsRecurring ? editTaskRecurringInterval : undefined,
              tags: editTaskTags
            }
          : task
      )
    );

    setEditingTaskId(null);
  };

  // Tag management
  const addTag = () => {
    if (!newTag.trim() || editTaskTags.includes(newTag.trim())) return;
    setEditTaskTags([...editTaskTags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setEditTaskTags(editTaskTags.filter(t => t !== tag));
  };

  // Drag and drop handling for subtasks
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const taskId = source.droppableId.split('-')[1];

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtasks = [...task.subtasks];
    const [removed] = newSubtasks.splice(source.index, 1);
    newSubtasks.splice(destination.index, 0, removed);

    setTasks(
      tasks.map(t =>
        t.id === taskId
          ? { ...t, subtasks: newSubtasks }
          : t
      )
    );
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-indigo-600'} text-white p-4 shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">TickTick Clone</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block w-64">
              <input
                id="search-input"
                type="text"
                placeholder="Search tasks... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300`}
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
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="sm:hidden px-4 py-2 bg-gray-100 dark:bg-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300`}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible) and Mobile (conditionally visible) */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block fixed md:relative z-10 md:z-auto inset-0 md:inset-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } md:w-64 shadow-md p-4 overflow-y-auto transition-all duration-300 ease-in-out`}
        >
          <div className="mb-6">
            <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : ''}`}>Lists</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedListId('all')}
                  className={`w-full flex items-center px-3 py-2 rounded-md ${
                    selectedListId === 'all'
                      ? darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
                      selectedListId === list.id
                        ? darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
                  className={`w-full px-3 py-2 border rounded-md mb-2 ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                  }`}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addList}
                    className={`px-3 py-1 rounded-md ${
                      darkMode ? 'bg-indigo-800 hover:bg-indigo-900' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListName('');
                    }}
                    className={`px-3 py-1 rounded-md ${
                      darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className={`mt-2 flex items-center ${
                  darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                }`}
              >
                <FiPlus className="mr-1" /> Add List
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  id="new-task-input"
                  placeholder="What needs to be done? (Press 'n' to focus)"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                  }`}
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      List
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                      }`}
                    >
                      {lists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Due Date
                    </label>
                    <DatePicker
                      selected={selectedDueDate}
                      onChange={(date) => setSelectedDueDate(date)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                      }`}
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
                    className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      darkMode
                        ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h2 className="text-xl font-semibold">
                  {selectedListId === 'all' ? 'All Tasks' : lists.find(list => list.id === selectedListId)?.name || 'Tasks'}
                </h2>

                {/* Sorting and filtering controls */}
                <div className="flex flex-wrap items-center gap-2 sm:space-x-4">
                  <div className="flex items-center">
                    <label className={`text-sm mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sort:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`text-sm px-2 py-1 rounded-md ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="title">Title</option>
                    </select>
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className={`ml-1 p-1 rounded-md ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>

                  <div className="flex items-center">
                    <label className={`text-sm mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show:</label>
                    <select
                      value={filterCompleted === null ? 'all' : filterCompleted ? 'completed' : 'active'}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilterCompleted(value === 'all' ? null : value === 'completed');
                      }}
                      className={`text-sm px-2 py-1 rounded-md ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tag filters */}
              {allTags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                      className={`px-2 py-1 text-xs rounded-full flex items-center ${
                        filterTags.includes(tag)
                          ? darkMode ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-800'
                          : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <FiTag className="mr-1" />
                      {tag}
                      {filterTags.includes(tag) && (
                        <FiX className="ml-1" />
                      )}
                    </button>
                  ))}
                  {filterTags.length > 0 && (
                    <button
                      onClick={() => setFilterTags([])}
                      className={`px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              <DragDropContext onDragEnd={handleDragEnd}>
                <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredTasks.map(task => (
                    <li key={task.id} className="py-4">
                      {editingTaskId === task.id ? (
                        // Task edit form
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md ${
                              darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                            }`}
                            placeholder="Task title"
                          />

                          <TextareaAutosize
                            value={editTaskNotes}
                            onChange={(e) => setEditTaskNotes(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md ${
                              darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                            }`}
                            placeholder="Add notes (optional)"
                            minRows={2}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                List
                              </label>
                              <select
                                value={editTaskListId}
                                onChange={(e) => setEditTaskListId(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                  darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                }`}
                              >
                                {lists.map(list => (
                                  <option key={list.id} value={list.id}>
                                    {list.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Priority
                              </label>
                              <select
                                value={editTaskPriority}
                                onChange={(e) => setEditTaskPriority(e.target.value as Priority)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                  darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                }`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Due Date
                              </label>
                              <DatePicker
                                selected={editTaskDueDate}
                                onChange={(date) => setEditTaskDueDate(date)}
                                className={`w-full px-3 py-2 border rounded-md ${
                                  darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                }`}
                                placeholderText="Select a date"
                                dateFormat="MMM d, yyyy"
                                isClearable
                              />
                            </div>

                            <div>
                              <div className="flex items-center mb-2">
                                <input
                                  type="checkbox"
                                  id="isRecurring"
                                  checked={editTaskIsRecurring}
                                  onChange={(e) => setEditTaskIsRecurring(e.target.checked)}
                                  className="mr-2"
                                />
                                <label htmlFor="isRecurring" className={`text-sm font-medium ${
                                  darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Recurring Task
                                </label>
                              </div>

                              {editTaskIsRecurring && (
                                <div className="flex space-x-2">
                                  <select
                                    value={editTaskRecurringPattern}
                                    onChange={(e) => setEditTaskRecurringPattern(e.target.value as RecurringPattern)}
                                    className={`w-full px-3 py-2 border rounded-md ${
                                      darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                    }`}
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                  </select>

                                  <input
                                    type="number"
                                    min="1"
                                    value={editTaskRecurringInterval}
                                    onChange={(e) => setEditTaskRecurringInterval(parseInt(e.target.value) || 1)}
                                    className={`w-16 px-3 py-2 border rounded-md ${
                                      darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tags section */}
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {editTaskTags.map(tag => (
                                <div
                                  key={tag}
                                  className={`px-2 py-1 text-xs rounded-full flex items-center ${
                                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <span>{tag}</span>
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                  >
                                    <FiX />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex">
                              <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a tag"
                                className={`flex-1 px-3 py-2 border rounded-l-md ${
                                  darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                }`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                  }
                                }}
                              />
                              <button
                                onClick={addTag}
                                className={`px-3 py-2 rounded-r-md ${
                                  darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={cancelEditingTask}
                              className={`px-4 py-2 border rounded-md ${
                                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEditedTask}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Task display
                        <div>
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
                                <div className="flex items-center">
                                  <p className="text-sm font-medium">{task.title}</p>
                                  {task.isRecurring && (
                                    <FiRepeat className="ml-2 text-indigo-500" title="Recurring task" />
                                  )}
                                </div>

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

                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {task.tags.map(tag => (
                                      <span
                                        key={tag}
                                        className={`px-2 py-0.5 text-xs rounded-full flex items-center ${
                                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        <FiTag className="mr-1" size={10} />
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Notes preview */}
                                {task.notes && (
                                  <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.notes.length > 100
                                      ? `${task.notes.substring(0, 100)}...`
                                      : task.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleTaskExpanded(task.id)}
                                className={`text-gray-400 hover:${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                title={expandedTaskIds.includes(task.id) ? "Collapse" : "Expand"}
                              >
                                {expandedTaskIds.includes(task.id) ? (
                                  <FiChevronUp className="h-5 w-5" />
                                ) : (
                                  <FiChevronDown className="h-5 w-5" />
                                )}
                              </button>
                              <button
                                onClick={() => startEditingTask(task)}
                                className={`text-gray-400 hover:${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                title="Edit task"
                              >
                                <FiEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-gray-400 hover:text-red-500"
                                title="Delete task"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded section with subtasks */}
                          {expandedTaskIds.includes(task.id) && (
                            <div className="mt-4 pl-8">
                              {/* Subtasks */}
                              <div className="mb-4">
                                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Subtasks
                                </h4>

                                <Droppable droppableId={`subtasks-${task.id}`}>
                                  {(provided) => (
                                    <ul
                                      className="space-y-2"
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                    >
                                      {task.subtasks.map((subtask, index) => (
                                        <Draggable
                                          key={subtask.id}
                                          draggableId={subtask.id}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <li
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="flex items-center justify-between"
                                            >
                                              <div className="flex items-center">
                                                <button
                                                  onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                                  className="mr-2"
                                                >
                                                  {subtask.completed ? (
                                                    <FiCheckCircle className="h-4 w-4 text-indigo-600" />
                                                  ) : (
                                                    <FiCircle className="h-4 w-4 text-gray-400" />
                                                  )}
                                                </button>
                                                <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                                                  {subtask.title}
                                                </span>
                                              </div>
                                              <button
                                                onClick={() => deleteSubtask(task.id, subtask.id)}
                                                className="text-gray-400 hover:text-red-500"
                                              >
                                                <FiTrash2 className="h-4 w-4" />
                                              </button>
                                            </li>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </ul>
                                  )}
                                </Droppable>

                                {/* Add subtask form */}
                                <div className="mt-2 flex">
                                  <input
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="Add a subtask"
                                    className={`flex-1 px-3 py-1 text-sm border rounded-l-md ${
                                      darkMode ? 'bg-gray-700 text-white border-gray-600' : ''
                                    }`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSubtask(task.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => addSubtask(task.id)}
                                    className={`px-3 py-1 rounded-r-md ${
                                      darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              {/* Recurring task info */}
                              {task.isRecurring && (
                                <div className="mb-4">
                                  <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Recurring
                                  </h4>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Repeats every {task.recurringInterval} {task.recurringPattern}
                                    {task.recurringInterval !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              )}

                              {/* Full notes */}
                              {task.notes && (
                                <div>
                                  <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Notes
                                  </h4>
                                  <p className={`text-sm whitespace-pre-wrap ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                  {filteredTasks.length === 0 && (
                    <li className="py-4 text-center text-gray-500">
                      No tasks match your filters. Try adjusting your search or filters.
                    </li>
                  )}
                </ul>
              </DragDropContext>
            </div>
          </div>
        </main>
      </div>

      <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm border-t`}>
        <p>TickTick Clone - A comprehensive task management application</p>
        <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs">
          <p>Keyboard shortcuts: 'n' for new task, '/' for search, 'd' for dark mode</p>
          <p>Features: Subtasks, Notes, Tags, Recurring Tasks, Dark Mode</p>
          <p>Sorting: By Due Date, Priority, or Title</p>
        </div>
      </footer>
    </div>
  );
}
