# Task Management (ToDo List)

A simple and functional task management application built with Next.js (App Router), tRPC, and React Query.

## 🛠️ Technologies Used

- **Next.js (v15)**: Used with App Router for the application structure. `Server-Side Rendering (SSR)` was implemented by loading the initial data (`initialData`) in the Server Component and passing it to the client.
- **tRPC**: Chosen to create an end-to-end Typesafe API without the need for code generators.
- **React Query**: Used in conjunction with tRPC for caching, mutations, and Infinite Scroll.
- **Zod**: For input data validation on tRPC routes.
- **Tailwind CSS**: Simple, clean, and functional styling (less is more!).

## 🚀 How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at: [http://localhost:3000](http://localhost:3000)

## 📋 Features and Decisions

- **In-Memory CRUD**: Tasks are saved in memory on the backend (in `utils/server/appRouter.ts`). The list resets when the server restarts.
- **SSR (Server-Side Rendering)**: The main page (`app/page.tsx`) directly calls the `getTasks` tRPC route to pre-load data. This sends the tasks in the first HTML response, improving SEO and loading time.
- **Infinite Scroll**: Implemented in the list using `useInfiniteQuery`. The list automatically fetches additional tasks as the user scrolls to the bottom of the page.
- **Feedback and Error Handling**: We use the React Query `useMutation` feature to catch errors returned by the backend and alert the user, alongside frontend validations (Zod and HTML attributes).
- **Componentization**: The application was split into smaller components (`TaskList` and `TaskForm`) to facilitate maintenance.
