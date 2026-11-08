// store/slices/onboarding.js
// Onboarding state only: whether quickstart is completed.
// Communicates with ZeroClaw gateway via getQuickstartState().
import { getQuickstartState } from '../../api/client';

export const createOnboardingSlice = (set, get) => ({
  onboarding: {
    quickstartCompleted: false,
    loading: false,
    error: null,
    setQuickstartCompleted: (completed) => set((state) => ({
      onboarding: { ...state.onboarding, quickstartCompleted: Boolean(completed) },
    })),
    checkQuickstartStatus: async () => {
      set((state) => ({
        onboarding: { ...state.onboarding, loading: true, error: null },
      }));
      try {
        const res = await getQuickstartState();
        const completed = Boolean(res?.quickstart_completed ?? res?.quickstartCompleted ?? res?.completed);
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            quickstartCompleted: completed,
            loading: false,
            error: null,
          },
        }));
        return completed;
      } catch (err) {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            loading: false,
            error: err?.message || 'Gagal memeriksa status quickstart',
          },
        }));
        throw err;
      }
    },
  },
});
