// store/index.js
// Single store, composed of slices. Each slice is nested under
// its own key, so slices cannot overwrite each other's keys
// when spread together. Pages subscribe to slices, not to the
// whole store.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createChatSlice } from './slices/chat';
import { createSessionsSlice } from './slices/sessions';
import { createSettingsSlice } from './slices/settings';
import { createIdentitySlice } from './slices/identity';
import { createConnectionSlice } from './slices/connection';
import { createChannelsSlice } from './slices/channels';
import { createOnboardingSlice } from './slices/onboarding';

export const useStore = create(
  persist(
    (...a) => ({
      ...createChatSlice(...a),
      ...createSessionsSlice(...a),
      ...createSettingsSlice(...a),
      ...createIdentitySlice(...a),
      ...createConnectionSlice(...a),
      ...createChannelsSlice(...a),
      ...createOnboardingSlice(...a),
    }),
    {
      name: 'muse-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        connection: {
          baseUrl: state.connection.baseUrl,
          authToken: state.connection.authToken,
          paired: state.connection.paired,
        },
        onboarding: {
          quickstartCompleted: state.onboarding.quickstartCompleted,
        },
        settings: state.settings,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        connection: {
          ...currentState.connection,
          ...(persistedState?.connection || {}),
        },
        onboarding: {
          ...currentState.onboarding,
          ...(persistedState?.onboarding || {}),
        },
        settings: {
          ...currentState.settings,
          ...(persistedState?.settings || {}),
        },
      }),
    }
  )
);
