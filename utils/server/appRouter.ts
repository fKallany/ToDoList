import { publicProcedure, router } from './trpc';
import { z } from 'zod';

export type Task = {
  id: number;
  title: string;
  description?: string;
  createdAt: number;
};

function generateTasks(amount: number): Task[] {
  return Array.from({ length: amount }, (_, i) => {
    const id = i + 1;

    return {
      id,
      title: `Task ${id} - Feature ${id}`,
      description: `This is the description for task ${id}`,
      createdAt: Date.now() - (amount - id) * 10000,
    };
  });
}

// In-memory storage for tasks
let tasks: Task[] = generateTasks(20);

export const appRouter = router({
  // List Tasks
  getTasks: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).nullish(),
      cursor: z.number().nullish()
    }).optional())
    .query(async ({ input }) => {
      // Fetches a paginated list of tasks based on a cursor
      // Sorts tasks by descending creation date
      const limit = input?.limit ?? 5;
      const { cursor } = input ?? {};

      const sortedTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);

      const startIndex = cursor ?? 0;
      const paginatedTasks = sortedTasks.slice(startIndex, startIndex + limit);

      const nextCursor = startIndex + limit < sortedTasks.length ? startIndex + limit : undefined;

      return {
        tasks: paginatedTasks,
        nextCursor,
      };
    }),

  // Create Task
  createTask: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, 'The title is required'),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      // Creates a new task and adds it to the list
      // Generates a unique ID and current timestamp
      const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
      const newTask: Task = {
        id: maxId + 1,
        title: input.title,
        description: input.description,
        createdAt: Date.now(),
      };

      tasks.push(newTask);
      return newTask;
    }),

  // Update Task
  updateTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, 'The title is required').optional(),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      // Updates an existing task by its ID
      // Throws an error if the task is not found
      const taskIndex = tasks.findIndex((t) => t.id === input.id);

      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
      };

      return tasks[taskIndex];
    }),

  // Delete Task
  deleteTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      // Removes a task from the list by its ID
      // Throws an error if the task does not exist
      const taskIndex = tasks.findIndex((t) => t.id === input.id);

      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const deletedTask = tasks[taskIndex];
      tasks = tasks.filter((t) => t.id !== input.id);

      return deletedTask;
    }),
});

export type AppRouter = typeof appRouter;
