'use client';

import { useTRPC } from '@/utils/client/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { Task } from '@/utils/server/appRouter';

type TaskFormProps = {
  taskToEdit?: Task | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function TaskForm({ taskToEdit, onSuccess, onCancel }: TaskFormProps) {
  // Renders the form for creating and updating tasks
  // Manages local state for inputs and calls tRPC mutations
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [taskToEdit]);

  const createMutation = useMutation(trpc.createTask.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.getTasks.queryKey() });
      setTitle('');
      setDescription('');
      setErrorMsg('');
      if (onSuccess) onSuccess();
      alert('Task created successfully!');
    },
    onError: (err) => {
      setErrorMsg(`Error creating task: ${err.message}`);
    }
  }));

  const updateMutation = useMutation(trpc.updateTask.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.getTasks.queryKey() });
      setErrorMsg('');
      if (onSuccess) onSuccess();
      alert('Task updated successfully!');
    },
    onError: (err) => {
      setErrorMsg(`Error updating task: ${err.message}`);
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    // Handles form submission for creating or updating a task
    // Validates the title and calls the appropriate mutation
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('The title is required.');
      return;
    }

    if (taskToEdit) {
      updateMutation.mutate({ id: taskToEdit.id, title, description });
    } else {
      createMutation.mutate({ title, description });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">
        {taskToEdit ? 'Edit Task' : 'New Task'}
      </h2>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Study Next.js"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Read the official documentation"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          {taskToEdit && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              disabled={isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isPending ? 'Saving...' : taskToEdit ? 'Update' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}