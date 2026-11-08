// store/slices/onboarding.js
// Onboarding and quickstart wizard state.
// Communicates with ZeroClaw gateway via api/client.
// The store imports this, screens never do.
import {
  getQuickstartState,
  getQuickstartFields,
  validateQuickstart,
  applyQuickstart,
  dismissQuickstart,
  getPersonalityTemplates,
} from '../../api/client';

export const createOnboardingSlice = (set, get) => ({
  onboarding: {
    quickstartCompleted: false,
    loading: false,
    error: null,
    stateData: null,
    fieldsCache: {},
    personalityTemplates: null,

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
            stateData: res,
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

    fetchQuickstartState: async () => {
      set((state) => ({
        onboarding: { ...state.onboarding, loading: true, error: null },
      }));
      try {
        const data = await getQuickstartState();
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            stateData: data,
            quickstartCompleted: Boolean(data?.quickstart_completed),
            loading: false,
            error: null,
          },
        }));
        return data;
      } catch (err) {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            loading: false,
            error: err?.message || 'Gagal mengambil konfigurasi quickstart',
          },
        }));
        throw err;
      }
    },

    fetchSectionFields: async (section, typeKey) => {
      const cacheKey = `${section}:${typeKey}`;
      const cached = get().onboarding?.fieldsCache?.[cacheKey];
      if (cached) return cached;

      try {
        const res = await getQuickstartFields(section, typeKey);
        const fields = res?.fields || [];
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            fieldsCache: {
              ...state.onboarding.fieldsCache,
              [cacheKey]: fields,
            },
          },
        }));
        return fields;
      } catch (err) {
        console.warn(`[onboarding] Gagal mengambil fields untuk ${cacheKey}:`, err);
        return [];
      }
    },

    fetchPersonalityTemplates: async (params = {}) => {
      try {
        const res = await getPersonalityTemplates(params);
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            personalityTemplates: res,
          },
        }));
        return res;
      } catch (err) {
        console.warn('[onboarding] Gagal mengambil template personality:', err);
        return null;
      }
    },

    validateQuickstart: async (payload) => {
      set((state) => ({
        onboarding: { ...state.onboarding, loading: true, error: null },
      }));
      try {
        const res = await validateQuickstart(payload);
        set((state) => ({
          onboarding: { ...state.onboarding, loading: false },
        }));
        return res;
      } catch (err) {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            loading: false,
            error: err?.message || 'Validasi quickstart gagal',
          },
        }));
        throw err;
      }
    },

    submitQuickstart: async (payload) => {
      set((state) => ({
        onboarding: { ...state.onboarding, loading: true, error: null },
      }));
      try {
        const valRes = await validateQuickstart(payload);
        if (valRes?.kind === 'errors' && Array.isArray(valRes.errors) && valRes.errors.length > 0) {
          set((state) => ({
            onboarding: { ...state.onboarding, loading: false },
          }));
          return { ok: false, errors: valRes.errors };
        }

        const applyRes = await applyQuickstart(payload);
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            quickstartCompleted: true,
            loading: false,
            error: null,
          },
        }));
        return { ok: true, data: applyRes };
      } catch (err) {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            loading: false,
            error: err?.message || 'Gagal menerapkan konfigurasi quickstart',
          },
        }));
        throw err;
      }
    },

    applyQuickstart: async (payload) => {
      set((state) => ({
        onboarding: { ...state.onboarding, loading: true, error: null },
      }));
      try {
        const res = await applyQuickstart(payload);
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            quickstartCompleted: true,
            loading: false,
            error: null,
          },
        }));
        return res;
      } catch (err) {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            loading: false,
            error: err?.message || 'Gagal menerapkan konfigurasi quickstart',
          },
        }));
        throw err;
      }
    },

    dismissQuickstart: async (lastStep = 'quickstart') => {
      set((state) => ({
        onboarding: { ...state.onboarding, loading: true, error: null },
      }));
      try {
        await dismissQuickstart({ lastStep });
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            quickstartCompleted: true,
            loading: false,
            error: null,
          },
        }));
        return true;
      } catch (err) {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            loading: false,
            error: err?.message || 'Gagal melewati quickstart',
          },
        }));
        throw err;
      }
    },
  },
});
