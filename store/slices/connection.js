// store/slices/connection.js
// Connection slice. Holds gateway connection state:
// base URL, auth token, and paired status.
import { GATEWAY_BASE_URL } from '../../api/config';

export const createConnectionSlice = (set) => ({
  connection: {
    baseUrl: GATEWAY_BASE_URL,
    authToken: null,
    paired: false,
    error: null,
    setBaseUrl: (baseUrl) => set((state) => ({
      connection: { ...state.connection, baseUrl },
    })),
    setAuthToken: (authToken) => set((state) => ({
      connection: { ...state.connection, authToken, paired: Boolean(authToken) },
    })),
    setPaired: (paired) => set((state) => ({
      connection: { ...state.connection, paired },
    })),
    setError: (error) => set((state) => ({
      connection: { ...state.connection, error },
    })),
  },
});
