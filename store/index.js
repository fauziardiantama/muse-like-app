// store/index.js
// Single store, composed of slices. Each slice is nested under
// its own key, so slices cannot overwrite each other's keys
// when spread together. Pages subscribe to slices, not to the
// whole store.
import { create } from 'zustand';
import { createChatSlice } from './slices/chat';
import { createSessionsSlice } from './slices/sessions';
import { createSettingsSlice } from './slices/settings';
import { createIdentitySlice } from './slices/identity';
import { createConnectionSlice } from './slices/connection';
import { createChannelsSlice } from './slices/channels';

export const useStore = create((...a) => ({
  ...createChatSlice(...a),
  ...createSessionsSlice(...a),
  ...createSettingsSlice(...a),
  ...createIdentitySlice(...a),
  ...createConnectionSlice(...a),
  ...createChannelsSlice(...a),
}));
