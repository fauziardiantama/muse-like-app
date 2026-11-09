// store/slices/sessions.js
// Session slice. Owns the session list and the current session.
// Fetches all sessions across all agents from ZeroClaw gateway.
import { getSessions } from '../../api/client';

export const createSessionsSlice = (set, get) => ({
  sessions: {
    list: [],
    currentSessionId: null,
    loading: false,
    error: null,

    loadSessions: async () => {
      try {
        set((s) => ({ sessions: { ...s.sessions, loading: true, error: null } }));
        // Ensure connection config is in sync before calling API
        get().connection?.syncClientConfig?.();
        const res = await getSessions();
        const list = Array.isArray(res?.sessions) ? res.sessions : (Array.isArray(res) ? res : []);
        set((s) => ({
          sessions: {
            ...s.sessions,
            list,
            loading: false,
          },
        }));
      } catch (err) {
        set((s) => ({
          sessions: {
            ...s.sessions,
            error: err?.message || 'Gagal memuat sesi',
            loading: false,
          },
        }));
      }
    },

    setSessions: (list) => set((state) => ({
      sessions: { ...state.sessions, list },
    })),
    setCurrentSessionId: (currentSessionId) => set((state) => ({
      sessions: { ...state.sessions, currentSessionId },
    })),
  },
});
