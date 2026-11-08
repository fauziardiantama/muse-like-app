// api/config.js
// Connection settings only. No endpoints, no fetch, no state.
// Change the server here, nowhere else.

// Server hosting is not decided yet, so this is a placeholder.
export const GATEWAY_BASE_URL = 'http://localhost:3000';

export const TIMEOUT_MS = 15000;

// Retries are for transient network failures and timeouts only.
// 1 means one retry after the first attempt, not a loop.
export const MAX_RETRIES = 1;

// Pairing is required for authenticated endpoints.
// Unpaired state blocks sending, it does not fall back to anonymous.
export const REQUIRE_PAIRING = true;
