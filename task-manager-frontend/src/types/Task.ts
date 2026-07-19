import type { Tag } from "./Tag.ts";

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  tags: Tag[];
  createdAt?: string;
  updatedAt?: string;
}
