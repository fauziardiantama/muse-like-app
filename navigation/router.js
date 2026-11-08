import { createContext, useContext, useState } from 'react';

// Minimal stack router. No navigation library, no deep links, no auth
// yet — this app has two page types, chat and settings, and that is
// all this router needs to express. A new page is a new route name
// here plus a new file in screens/, with no change to App.js logic
// beyond the route table below.
//
// Routes: 'chat' (root, home) and 'settings'.
// push(route) adds to the stack, goBack() pops, never below root.
export const ROUTES = {
  chat: 'chat',
  settings: 'settings',
};

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [stack, setStack] = useState([ROUTES.chat]);
  const route = stack[stack.length - 1];
  const push = (next) => setStack((prev) => [...prev, next]);
  const goBack = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  return (
    <RouterContext.Provider value={{ route, stack, push, goBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider');
  return ctx;
}
