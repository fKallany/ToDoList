import { publicProcedure, router } from './trpc';
import { z } from 'zod';

export type Task = {
  id: number;
  title: string;
  description?: string;
  createdAt: number;
};

// In-memory storage for tasks
let tasks: Task[] = [
  { id: 1, title: 'Study Next.js', description: 'Learn about App Router', createdAt: Date.now() - 500000 },
  { id: 2, title: 'Implement tRPC', description: 'Configure tRPC with React Query', createdAt: Date.now() - 490000 },
  { id: 3, title: 'Refactor API', description: 'Improve REST endpoints structure', createdAt: Date.now() - 480000 },
  { id: 4, title: 'Fix login bug', description: 'Resolve token expiration issue', createdAt: Date.now() - 470000 },
  { id: 5, title: 'Create dashboard UI', description: 'Design analytics components', createdAt: Date.now() - 460000 },
  { id: 6, title: 'Optimize queries', description: 'Reduce database load time', createdAt: Date.now() - 450000 },
  { id: 7, title: 'Write unit tests', description: 'Cover auth service logic', createdAt: Date.now() - 440000 },
  { id: 8, title: 'Setup CI/CD', description: 'Configure GitHub Actions pipeline', createdAt: Date.now() - 430000 },
  { id: 9, title: 'Add dark mode', description: 'Implement theme switching', createdAt: Date.now() - 420000 },
  { id: 10, title: 'Improve SEO', description: 'Add meta tags and sitemap', createdAt: Date.now() - 410000 },
];

export const appRouter = router({
  // List Tasks
  getTasks: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).nullish(), cursor: z.number().nullish() }).optional())
    .query(({ input }) => {
      // Fetches a paginated list of tasks based on a cursor
      // Sorts tasks by descending creation date
      const limit = input?.limit ?? 10;
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
