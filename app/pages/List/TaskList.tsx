'use client';

import { useTRPC } from '@/utils/client/trpc';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import TaskForm from '../Form';
import type { Task } from '@/utils/server/appRouter';

type TaskListProps = {
  initialData: {
    tasks: Task[];
    nextCursor: number | undefined;
  };
};

export default function TaskList({ initialData }: TaskListProps) {
  // Renders a list of tasks with infinite scrolling
  // Handles task deletion and editing states
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isScroll, setIsScroll] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    ...trpc.getTasks.infiniteQueryOptions(
      { limit: 5 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: null,
      }
    ),
    initialData: {
      pages: [initialData],
      pageParams: [null],
    },
  });

  const deleteMutation = useMutation(trpc.deleteTask.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.getTasks.queryKey() });
      refetch();
      alert('Task deleted successfully!');
    },
    onError: (err) => {
      alert(`Error deleting task: ${err.message}`);
    }
  }));

  const handleDelete = (id: number) => {
    // Prompts user for confirmation before deleting a task
    // Triggers delete mutation if confirmed
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate({ id });
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Handles infinite scrolling behavior
      // Fetches the next page of tasks when scrolling near the bottom
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage &&
        !loadingRef.current
      ) {
        loadingRef.current = true;
        setIsScroll(true);
        timeoutId = setTimeout(() => {
          fetchNextPage().finally(() => {
            loadingRef.current = false;
            setIsScroll(false);
          });
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <div className="text-center p-4">Loading tasks...</div>;
  if (isError) return <div className="text-red-500 p-4">Error loading tasks: {error?.message}</div>;

  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <TaskForm
        taskToEdit={taskToEdit}
        onSuccess={() => {
          setTaskToEdit(null);
          queryClient.invalidateQueries({ queryKey: trpc.getTasks.queryKey() });
          refetch();
        }}
        onCancel={() => setTaskToEdit(null)}
      />

      <div className="flex flex-col gap-4 mt-8">
        <h2 className="text-xl font-semibold">Task List ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{task.title}</h3>
                {task.description && <p className="text-gray-600 mt-1">{task.description}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  Created at: {isMounted ? `${new Date(task.createdAt).toLocaleDateString('en-US')} ${new Date(task.createdAt).toLocaleTimeString('en-US')}` : ''}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setTaskToEdit(task)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
        {(isFetchingNextPage || isScroll) && (
          <div className="flex justify-center items-center p-6 gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium">Loading more tasks...</span>
          </div>
        )}
        {!hasNextPage && tasks.length > 0 && (
          <div className="text-center text-gray-500 p-4">You have reached the end of the list.</div>
        )}
      </div>
    </div>
  );
}