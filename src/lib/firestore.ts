import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';
import { Task, List, Subtask } from '@/types/types';

// User-related operations
export const createUserDocument = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: Timestamp.now()
    });
  }
};

// List operations
export const getUserLists = async (userId: string): Promise<List[]> => {
  const listsQuery = query(
    collection(db, 'lists'),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );
  
  const querySnapshot = await getDocs(listsQuery);
  const lists: List[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    lists.push({
      id: doc.id,
      name: data.name,
      userId: data.userId,
      createdAt: data.createdAt.toDate()
    });
  });
  
  return lists;
};

export const createList = async (list: Omit<List, 'id' | 'createdAt'>): Promise<string> => {
  const listRef = collection(db, 'lists');
  const newList = {
    ...list,
    createdAt: Timestamp.now()
  };
  
  const docRef = await addDoc(listRef, newList);
  return docRef.id;
};

export const updateList = async (listId: string, name: string): Promise<void> => {
  const listRef = doc(db, 'lists', listId);
  await updateDoc(listRef, { name });
};

export const deleteList = async (listId: string): Promise<void> => {
  const listRef = doc(db, 'lists', listId);
  await deleteDoc(listRef);
  
  // Delete all tasks in this list
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('listId', '==', listId)
  );
  
  const querySnapshot = await getDocs(tasksQuery);
  
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Task operations
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(tasksQuery);
  const tasks: Task[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    tasks.push({
      id: doc.id,
      title: data.title,
      completed: data.completed,
      dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
      priority: data.priority,
      listId: data.listId,
      notes: data.notes,
      subtasks: data.subtasks || [],
      isRecurring: data.isRecurring || false,
      recurringPattern: data.recurringPattern,
      recurringInterval: data.recurringInterval,
      tags: data.tags || [],
      userId: data.userId,
      createdAt: data.createdAt.toDate()
    });
  });
  
  return tasks;
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
  const taskRef = collection(db, 'tasks');
  const newTask = {
    ...task,
    createdAt: Timestamp.now(),
    dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
  };
  
  const docRef = await addDoc(taskRef, newTask);
  return docRef.id;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  
  const updatedFields: any = { ...updates };
  
  // Convert Date objects to Firestore Timestamps
  if (updates.dueDate) {
    updatedFields.dueDate = Timestamp.fromDate(updates.dueDate);
  }
  
  await updateDoc(taskRef, updatedFields);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};
