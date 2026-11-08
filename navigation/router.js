import { createContext, useContext, useState } from 'react';

// Minimal stack router. No navigation library, no deep links, no auth
// yet — this app has two page types, chat and settings, and that is
// all this router needs to express. A new page is a new route name
// here plus a new file in screens/, with no change to App.js logic
// beyond the route table below.
//
// Routes: 'token' (awal, root), 'quickstart', 'chat' (home), 'settings'.
// push(route) adds to the stack, goBack() pops, never below root.
// reset(route) replaces the whole stack: this is what the initial
// check uses, so a redirect to the start never leaves a back trail
// to the token page behind the quickstart/chat page.
export const ROUTES = {
  token: 'token',
  quickstart: 'quickstart',
  chat: 'chat',
  settings: 'settings',
};

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [stack, setStack] = useState([ROUTES.token]);
  const route = stack[stack.length - 1];
  const push = (next) => setStack((prev) => [...prev, next]);
  const goBack = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const reset = (next) => setStack([next]);
  return (
    <RouterContext.Provider value={{ route, stack, push, goBack, reset }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider');
  return ctx;
}
