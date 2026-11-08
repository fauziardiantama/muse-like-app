// store/slices/settings.js
// Settings slice. Holds settings values only.
// SettingsScreen is still visual-only in this build (Phase 4
// wires it to the config endpoints), so this slice is not
// read by any screen yet.
export const createSettingsSlice = (set) => ({
  settings: {
    values: {},
    setValue: (key, value) => set((state) => ({
      settings: {
        ...state.settings,
        values: { ...state.settings.values, [key]: value },
      },
    })),
  },
});
