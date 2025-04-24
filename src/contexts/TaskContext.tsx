'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Task, List, Subtask, Priority, RecurringPattern } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserLists,
  getUserTasks,
  createList,
  updateList,
  deleteList,
  createTask,
  updateTask,
  deleteTask
} from '@/lib/firestore';

interface TaskContextType {
  tasks: Task[];
  lists: List[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTaskItem: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTaskItem: (id: string) => Promise<void>;
  addList: (name: string) => Promise<void>;
  updateListItem: (id: string, name: string) => Promise<void>;
  deleteListItem: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  reorderSubtasks: (taskId: string, newSubtasks: Subtask[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch tasks and lists when user changes
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Fetch lists first
          const userLists = await getUserLists(currentUser.uid);
          
          // If no lists exist, create a default "Inbox" list
          if (userLists.length === 0) {
            const inboxListId = await createList({
              name: 'Inbox',
              userId: currentUser.uid
            });
            
            const workListId = await createList({
              name: 'Work',
              userId: currentUser.uid
            });
            
            const personalListId = await createList({
              name: 'Personal',
              userId: currentUser.uid
            });
            
            // Fetch lists again after creating default lists
            const updatedLists = await getUserLists(currentUser.uid);
            setLists(updatedLists);
          } else {
            setLists(userLists);
          }
          
          // Then fetch tasks
          const userTasks = await getUserTasks(currentUser.uid);
          setTasks(userTasks);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // If no user, use local storage
        const savedLists = localStorage.getItem('lists');
        const savedTasks = localStorage.getItem('tasks');
        
        if (savedLists) {
          try {
            const parsedLists = JSON.parse(savedLists);
            setLists(parsedLists);
          } catch (err) {
            console.error('Error parsing lists from localStorage:', err);
          }
        }
        
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks);
            
            // Convert date strings back to Date objects
            const tasksWithDates = parsedTasks.map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
            }));
            
            setTasks(tasksWithDates);
          } catch (err) {
            console.error('Error parsing tasks from localStorage:', err);
          }
        }
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Save data to localStorage when tasks or lists change (for non-authenticated users)
  useEffect(() => {
    if (!currentUser && tasks.length > 0) {
      const tasksForStorage = tasks.map(task => ({
        ...task,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString()
      }));
      
      localStorage.setItem('tasks', JSON.stringify(tasksForStorage));
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (!currentUser && lists.length > 0) {
      const listsForStorage = lists.map(list => ({
        ...list,
        createdAt: list.createdAt ? list.createdAt.toISOString() : new Date().toISOString()
      }));
      
      localStorage.setItem('lists', JSON.stringify(listsForStorage));
    }
  }, [lists, currentUser]);

  // Task operations
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Add task to Firestore
        const taskWithUser = {
          ...task,
          userId: currentUser.uid
        };
        
        const newTaskId = await createTask(taskWithUser);
        
        // Update local state
        const newTask: Task = {
          ...taskWithUser,
          id: newTaskId,
          createdAt: new Date()
        };
        
        setTasks(prev => [newTask, ...prev]);
      } else {
        // Add task to local state only
        const newTask: Task = {
          ...task,
          id: uuidv4(),
          userId: 'local-user',
          createdAt: new Date()
        };
        
        setTasks(prev => [newTask, ...prev]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskItem = async (id: string, updates: Partial<Task>) => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Update task in Firestore
        await updateTask(id, updates);
      }
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, ...updates } 
            : task
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskItem = async (id: string) => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Delete task from Firestore
        await deleteTask(id);
      }
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // List operations
  const addList = async (name: string) => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Add list to Firestore
        const newListId = await createList({
          name,
          userId: currentUser.uid
        });
        
        // Update local state
        const newList: List = {
          id: newListId,
          name,
          userId: currentUser.uid,
          createdAt: new Date()
        };
        
        setLists(prev => [...prev, newList]);
      } else {
        // Add list to local state only
        const newList: List = {
          id: uuidv4(),
          name,
          userId: 'local-user',
          createdAt: new Date()
        };
        
        setLists(prev => [...prev, newList]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateListItem = async (id: string, name: string) => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Update list in Firestore
        await updateList(id, name);
      }
      
      // Update local state
      setLists(prev => 
        prev.map(list => 
          list.id === id 
            ? { ...list, name } 
            : list
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteListItem = async (id: string) => {
    try {
      setLoading(true);
      
      if (currentUser) {
        // Delete list from Firestore
        await deleteList(id);
      }
      
      // Update local state
      setLists(prev => prev.filter(list => list.id !== id));
      setTasks(prev => prev.filter(task => task.listId !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Task completion toggle
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    await updateTaskItem(id, { completed: !task.completed });
  };

  // Subtask operations
  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed } 
        : subtask
    );
    
    await updateTaskItem(taskId, { subtasks: updatedSubtasks });
  };

  const addSubtask = async (taskId: string, title: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newSubtask: Subtask = {
      id: uuidv4(),
      title,
      completed: false
    };
    
    const updatedSubtasks = [...task.subtasks, newSubtask];
    
    await updateTaskItem(taskId, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
    
    await updateTaskItem(taskId, { subtasks: updatedSubtasks });
  };

  const reorderSubtasks = async (taskId: string, newSubtasks: Subtask[]) => {
    await updateTaskItem(taskId, { subtasks: newSubtasks });
  };

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        lists, 
        loading, 
        error, 
        addTask, 
        updateTaskItem, 
        deleteTaskItem, 
        addList, 
        updateListItem, 
        deleteListItem,
        toggleTaskCompletion,
        toggleSubtaskCompletion,
        addSubtask,
        deleteSubtask,
        reorderSubtasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
