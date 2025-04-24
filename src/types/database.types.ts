export type Task = {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  list_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type List = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
};
