// store/slices/onboarding.js
// Onboarding state only: whether quickstart is completed. The token
// itself is never stored here (see connection slice: it never holds
// the token value) — token presence is connection.paired.
// Quickstart detail (real form fields, apply) is for later; this
// flag is just what the initial check reads.
export const createOnboardingSlice = (set) => ({
  onboarding: {
    quickstartCompleted: false,
    setQuickstartCompleted: (completed) => set((state) => ({
      onboarding: { ...state.onboarding, quickstartCompleted: completed },
    })),
  },
});
