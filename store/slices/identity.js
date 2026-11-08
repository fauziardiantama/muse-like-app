// store/slices/identity.js
// Identity slice. Holds SOUL, IDENTITY, and USER content for
// the current agent. Editing is a Phase 5 decision (direct
// host file edit or a separate backend) — no gateway route
// for this exists, and ZeroClaw is not patched to add one.
export const createIdentitySlice = (set) => ({
  identity: {
    soul: '',
    identity: '',
    user: '',
    setSoul: (soul) => set((state) => ({
      identity: { ...state.identity, soul },
    })),
    setIdentity: (identity) => set((state) => ({
      identity: { ...state.identity, identity },
    })),
    setUser: (user) => set((state) => ({
      identity: { ...state.identity, user },
    })),
  },
});
