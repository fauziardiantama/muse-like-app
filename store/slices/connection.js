// store/slices/connection.js
// Connection slice. Holds gateway connection state only:
// base URL and paired status. It never holds the token value.
import { GATEWAY_BASE_URL } from '../../api/config';

export const createConnectionSlice = (set) => ({
  connection: {
    baseUrl: GATEWAY_BASE_URL,
    paired: false,
    error: null,
    setPaired: (paired) => set((state) => ({
      connection: { ...state.connection, paired },
    })),
    setError: (error) => set((state) => ({
      connection: { ...state.connection, error },
    })),
  },
});
