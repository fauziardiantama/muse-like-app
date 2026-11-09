// api/client.js
// Only importer of endpoints.js. Only place that calls fetch.
// The store imports this, screens never do.
import { ENDPOINTS, buildUrl, setActiveBaseUrl, getActiveBaseUrl } from './endpoints';
import { TIMEOUT_MS, MAX_RETRIES } from './config';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function clearClientAuth() {
  authToken = null;
}

export function hasAuthToken() {
  return authToken !== null;
}

export function setClientBaseUrl(url) {
  setActiveBaseUrl(url);
}

export function getClientBaseUrl() {
  return getActiveBaseUrl();
}

function buildHeaders(endpoint, extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (endpoint.auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function request(endpoint, { body, params = [], query, headers = {} } = {}) {
  let url = buildUrl(endpoint, ...params);
  if (query && typeof query === 'object') {
    const q = Object.entries(query)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (q) {
      url += (url.includes('?') ? '&' : '?') + q;
    }
  }
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
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {}

      if (res.status === 401) {
        throw { kind: 'unauthorized', status: 401, message: data?.error || 'Unauthorized' };
      }
      if (res.status === 403) {
        throw { kind: 'forbidden', status: 403, message: data?.error || 'Forbidden / Invalid pairing code' };
      }
      if (!res.ok) {
        throw { kind: 'gateway', status: res.status, message: data?.error || data?.message || `HTTP ${res.status}` };
      }
      return data !== null ? data : text;
    } catch (err) {
      clearTimeout(timer);
      lastError = err.name === 'AbortError'
        ? { kind: 'timeout', message: 'Koneksi timeout ke gateway server' }
        : err.kind
          ? err
          : { kind: 'network', message: err.message || 'Gagal terhubung ke jaringan' };
      if (lastError.kind !== 'network' && lastError.kind !== 'timeout') break;
    }
  }
  throw lastError;
}

export function checkHealth() {
  return request(ENDPOINTS.system.health);
}

export function getQuickstartState() {
  return request(ENDPOINTS.quickstart.state);
}

export function getQuickstartFields(section, typeKey) {
  return request(ENDPOINTS.quickstart.fields, {
    body: { section, type_key: typeKey },
  });
}

export function validateQuickstart(payload) {
  return request(ENDPOINTS.quickstart.validate, { body: payload });
}

export function applyQuickstart(payload) {
  return request(ENDPOINTS.quickstart.apply, { body: payload });
}

export function dismissQuickstart({ runId, surface = 'web', lastStep = 'quickstart' } = {}) {
  const run_id = runId || `mobile-${Date.now()}`;
  return request(ENDPOINTS.quickstart.dismiss, {
    body: { run_id, surface, last_step: lastStep },
  });
}

export function getPersonalityTemplates(query = {}) {
  return request(ENDPOINTS.personality.templates, { query });
}

export function getPersonalityFiles(agent) {
  return request(ENDPOINTS.personality.get, { query: { agent } });
}

export function getPersonalityFile(filename, agent) {
  return request(ENDPOINTS.personality.getFile, { params: [filename], query: { agent } });
}

export function putPersonalityFile(filename, content, agent) {
  return request(ENDPOINTS.personality.putFile, {
    params: [filename],
    query: { agent },
    body: { content },
  });
}

export function verifyAuthToken(token, customUrl) {
  if (customUrl) {
    setActiveBaseUrl(customUrl);
  }
  if (token) {
    setAuthToken(token);
  }
  return request(ENDPOINTS.system.apiHealth);
}

export async function pair(code, customUrl) {
  if (customUrl) {
    setActiveBaseUrl(customUrl);
  }
  const result = await request(ENDPOINTS.pairing.pair, {
    headers: { 'X-Pairing-Code': code },
  });
  const token = typeof result === 'object' && result?.token ? result.token : (typeof result === 'string' ? result : null);
  if (token) {
    setAuthToken(token);
  }
  return { token, raw: result };
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

export function renameMapKey(path, from, to) {
  return request(ENDPOINTS.config.renameMapKey, {
    body: { path, from, to },
  });
}
