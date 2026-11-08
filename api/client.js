// api/client.js
// Only importer of endpoints.js. Only place that calls fetch.
// The store imports this, screens never do.
import { ENDPOINTS, buildUrl } from './endpoints';
import { TIMEOUT_MS, MAX_RETRIES } from './config';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function hasAuthToken() {
  return authToken !== null;
}

function buildHeaders(endpoint, extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (endpoint.auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function request(endpoint, { body, params = [], headers = {} } = {}) {
  const url = buildUrl(endpoint, ...params);
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: endpoint.method,
        headers: buildHeaders(endpoint, headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 401) {
        throw { kind: 'unauthorized', status: 401 };
      }
      if (!res.ok) {
        throw { kind: 'gateway', status: res.status };
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      lastError = err.name === 'AbortError'
        ? { kind: 'timeout' }
        : err.kind
          ? err
          : { kind: 'network' };
      if (lastError.kind !== 'network' && lastError.kind !== 'timeout') break;
    }
  }
  throw lastError;
}

export function checkHealth() {
  return request(ENDPOINTS.system.health);
}

export function pair(code) {
  return request(ENDPOINTS.pairing.pair, {
    headers: { 'X-Pairing-Code': code },
  });
}

export function getSessions() {
  return request(ENDPOINTS.sessions.list);
}

export function getSessionMessages(sessionId) {
  return request(ENDPOINTS.sessions.messages, { params: [sessionId] });
}

export function sendMessage(body) {
  return request(ENDPOINTS.messages.send, { body });
}
