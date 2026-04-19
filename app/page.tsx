import List from './pages/List';
import { appRouter } from '@/utils/server/appRouter';

export default async function Home() {
  // Main entry point for the application
  // Fetches initial task data for server-side rendering
  // SSR: Pre-loads the initial tasks directly from the tRPC router
  const initialData = await appRouter.createCaller({}).getTasks({ limit: 10 });

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center py-12 px-6 bg-white dark:bg-zinc-950">
        <List initialData={initialData} />
      </main>
    </div>
  );
}
