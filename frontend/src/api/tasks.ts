import api from '../utils/api';
import type { Task, NewTask } from '../types/Task';

type MongoTask = Omit<Task, 'id'> & { _id: string };

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get('/tasks');
 return res.data.map((task: MongoTask) => ({
    ...task,
    id: task._id,
  }));
};

export const addTask = async (task: NewTask): Promise<Task> => {
  const res = await api.post('/tasks', task);
  const { _id, ...data } : MongoTask = res.data;
  return { id: _id, ...data };
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTask = async (id: string, updated: Partial<Task>): Promise<Task> => {
  const res = await api.put(`/tasks/${id}`, updated);
  const { _id, ...data } = res.data;
  return { id: _id, ...data };
};