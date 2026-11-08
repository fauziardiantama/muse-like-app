// store/slices/sessions.js
// Session slice. Owns the session list and the current session.
// No auto-fetch: no screen calls loadSessions yet, so a missing
// gateway cannot break the installed app.
export const createSessionsSlice = (set) => ({
  sessions: {
    list: [],
    currentSessionId: null,
    loading: false,
    error: null,
    setSessions: (list) => set((state) => ({
      sessions: { ...state.sessions, list },
    })),
    setCurrentSessionId: (currentSessionId) => set((state) => ({
      sessions: { ...state.sessions, currentSessionId },
    })),
  },
});
