// store/slices/connection.js
// Connection slice. Holds gateway connection state:
// base URL, auth token, and paired status.
// All network orchestration and token lifecycles are centralized here.
import { GATEWAY_BASE_URL } from '../../api/config';
import {
  setClientBaseUrl,
  setAuthToken as setClientAuthToken,
  clearClientAuth,
  pair as apiPair,
  verifyAuthToken as apiVerifyAuthToken,
} from '../../api/client';
import { decideInitialRoute } from '../../navigation/initialCheck';
import { ROUTES } from '../../navigation/router';

export const createConnectionSlice = (set, get) => ({
  connection: {
    baseUrl: GATEWAY_BASE_URL,
    authToken: null,
    paired: false,
    loading: false,
    error: null,

    setBaseUrl: (baseUrl) => {
      const sanitized = baseUrl ? baseUrl.trim().replace(/\/+$/, '') : GATEWAY_BASE_URL;
      setClientBaseUrl(sanitized);
      set((state) => ({
        connection: { ...state.connection, baseUrl: sanitized },
      }));
    },

    setAuthToken: (authToken) => {
      setClientAuthToken(authToken);
      set((state) => ({
        connection: {
          ...state.connection,
          authToken,
          paired: Boolean(authToken),
        },
      }));
    },

    setPaired: (paired) => set((state) => ({
      connection: { ...state.connection, paired },
    })),

    setError: (error) => set((state) => ({
      connection: { ...state.connection, error },
    })),

    // Membersihkan state autentikasi di store dan di module api/client
    clearAuth: () => {
      clearClientAuth();
      set((state) => ({
        connection: {
          ...state.connection,
          authToken: null,
          paired: false,
        },
      }));
    },

    // Sinkronisasi konfigurasi aktif ke api/client
    syncClientConfig: () => {
      const { baseUrl, authToken } = get().connection;
      if (baseUrl) {
        setClientBaseUrl(baseUrl);
      }
      setClientAuthToken(authToken || null);
    },

    // Inisialisasi status koneksi & rute awal saat aplikasi dibuka
    checkStartupStatus: async () => {
      const slice = get().connection;
      slice.syncClientConfig();

      const storedToken = slice.authToken;
      const storedUrl = slice.baseUrl || GATEWAY_BASE_URL;

      if (!storedToken) {
        set((state) => ({
          connection: { ...state.connection, paired: false, loading: false },
        }));
        return ROUTES.token;
      }

      set((state) => ({
        connection: { ...state.connection, loading: true, error: null },
      }));

      try {
        let quickstartCompleted = false;
        // Prioritas: Panggil GET /api/quickstart/state (memvalidasi Bearer token & status quickstart)
        try {
          quickstartCompleted = await get().onboarding.checkQuickstartStatus();
        } catch (apiErr) {
          if (apiErr?.status === 404) {
            // Fallback untuk daemon versi lawas yang belum mengekspos quickstart/state
            await apiVerifyAuthToken(storedToken, storedUrl);
            quickstartCompleted = Boolean(get().onboarding?.quickstartCompleted);
          } else {
            throw apiErr;
          }
        }

        set((state) => ({
          connection: {
            ...state.connection,
            paired: true,
            loading: false,
            error: null,
          },
        }));

        const targetRoute = decideInitialRoute({
          hasToken: true,
          quickstartCompleted,
        });

        // Jika rute menuju chat, muat berkas identitas agen aktif di latar belakang secara non-blocking
        if (targetRoute === ROUTES.chat) {
          try {
            get().identity?.loadIdentity?.().catch(() => {});
          } catch {}
        }

        return targetRoute;
      } catch (err) {
        if (err?.status === 401 || err?.kind === 'unauthorized') {
          // Token ditolak server (kedaluwarsa atau invalid)
          slice.clearAuth();
          set((state) => ({
            connection: {
              ...state.connection,
              loading: false,
              error: 'Sesi autentikasi telah kedaluwarsa atau token tidak valid. Silakan pasangkan ulang.',
            },
          }));
        } else {
          set((state) => ({
            connection: {
              ...state.connection,
              loading: false,
              error: err?.message || 'Gagal terhubung ke gateway.',
            },
          }));
        }
        return ROUTES.token;
      }
    },

    // Orchestrator pairing menggunakan kode pairing
    pairWithCode: async (code, gatewayUrl) => {
      const sanitizedUrl = (gatewayUrl || get().connection.baseUrl || GATEWAY_BASE_URL).trim().replace(/\/+$/, '');
      const trimmedCode = (code || '').trim();

      if (!sanitizedUrl) {
        throw new Error('URL server tidak boleh kosong.');
      }
      if (!trimmedCode) {
        throw new Error('Kode pairing tidak boleh kosong.');
      }

      set((state) => ({
        connection: { ...state.connection, loading: true, error: null },
      }));

      try {
        setClientBaseUrl(sanitizedUrl);
        const { token } = await apiPair(trimmedCode, sanitizedUrl);

        if (!token) {
          throw new Error('Server tidak mengembalikan token auth.');
        }

        setClientAuthToken(token);

        let quickstartCompleted = false;
        try {
          quickstartCompleted = await get().onboarding.checkQuickstartStatus();
        } catch (stateErr) {
          console.warn('Gagal sinkronisasi quickstart state saat pairing:', stateErr);
        }

        set((state) => ({
          connection: {
            ...state.connection,
            baseUrl: sanitizedUrl,
            authToken: token,
            paired: true,
            loading: false,
            error: null,
          },
        }));

        const targetRoute = decideInitialRoute({
          hasToken: true,
          quickstartCompleted,
        });

        // Jika rute menuju chat, muat berkas identitas agen aktif di latar belakang secara non-blocking
        if (targetRoute === ROUTES.chat) {
          try {
            get().identity?.loadIdentity?.().catch(() => {});
          } catch {}
        }

        return targetRoute;
      } catch (err) {
        const msg = err.message || (err.kind === 'forbidden'
          ? 'Kode pairing tidak valid atau kedaluwarsa'
          : 'Gagal terhubung ke gateway');

        set((state) => ({
          connection: {
            ...state.connection,
            loading: false,
            error: msg,
          },
        }));
        throw new Error(msg);
      }
    },

    // Orchestrator verifikasi menggunakan token admin langsung
    submitAdminToken: async (token, gatewayUrl) => {
      const sanitizedUrl = (gatewayUrl || get().connection.baseUrl || GATEWAY_BASE_URL).trim().replace(/\/+$/, '');
      const trimmedToken = (token || '').trim();

      if (!sanitizedUrl) {
        throw new Error('URL server tidak boleh kosong.');
      }
      if (!trimmedToken) {
        throw new Error('Token admin tidak boleh kosong.');
      }

      set((state) => ({
        connection: { ...state.connection, loading: true, error: null },
      }));

      try {
        setClientBaseUrl(sanitizedUrl);
        setClientAuthToken(trimmedToken);

        let quickstartCompleted = false;
        try {
          quickstartCompleted = await get().onboarding.checkQuickstartStatus();
        } catch (apiErr) {
          if (apiErr?.status === 404) {
            await apiVerifyAuthToken(trimmedToken, sanitizedUrl);
            quickstartCompleted = Boolean(get().onboarding?.quickstartCompleted);
          } else {
            throw apiErr;
          }
        }

        set((state) => ({
          connection: {
            ...state.connection,
            baseUrl: sanitizedUrl,
            authToken: trimmedToken,
            paired: true,
            loading: false,
            error: null,
          },
        }));

        const targetRoute = decideInitialRoute({
          hasToken: true,
          quickstartCompleted,
        });

        // Jika rute menuju chat, muat berkas identitas agen aktif di latar belakang secara non-blocking
        if (targetRoute === ROUTES.chat) {
          try {
            get().identity?.loadIdentity?.().catch(() => {});
          } catch {}
        }

        return targetRoute;
      } catch (err) {
        const isUnauthorized = err?.status === 401 || err?.kind === 'unauthorized';
        const msg = err.message || (isUnauthorized
          ? 'Token admin tidak valid atau ditolak oleh gateway'
          : 'Gagal terhubung ke gateway');

        if (isUnauthorized) {
          setClientAuthToken(get().connection.authToken || null);
        }

        set((state) => ({
          connection: {
            ...state.connection,
            loading: false,
            error: msg,
          },
        }));
        throw new Error(msg);
      }
    },
  },
});
