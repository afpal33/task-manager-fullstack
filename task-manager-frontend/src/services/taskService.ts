import api from "./api";

export const getTasks = () => api.get('/tasks');

export const createTask = (title: string, desc: string, tags: string[] = []) =>
    api.post("/tasks", { title, description: desc, tags });

export const toggleTask = (id: number) => api.patch(`tasks/${id}/toggle`);

export const updateTask = (id: number, data: Record<string, unknown>) => api.put(`tasks/${id}`, data);

export const deleteTask = (id: number) => api.delete(`tasks/${id}`);

