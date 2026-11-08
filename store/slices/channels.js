// store/slices/channels.js
// Channels slice. Owns the channel list and its loading state.
// No auto-fetch: no screen calls it yet, so a missing gateway
// cannot break the installed app.
export const createChannelsSlice = (set) => ({
  channels: {
    list: [],
    loading: false,
    error: null,
    setChannels: (list) => set((state) => ({
      channels: { ...state.channels, list },
    })),
  },
});
