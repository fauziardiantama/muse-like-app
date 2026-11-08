// api/endpoints.js
// Whole-gateway registry, grouped by domain, not by page.
// No fetch here, no hardcoded base URL, no auth logic.
// The client is the only importer.
import { GATEWAY_BASE_URL } from './config';

export const ENDPOINTS = {
  system: {
    health: { method: 'GET', path: '/health', auth: false },
    apiHealth: { method: 'GET', path: '/api/health', auth: false },
    openapi: { method: 'GET', path: '/api/openapi.json', auth: false },
  },
  pairing: {
    pair: { method: 'POST', path: '/pair', auth: false },
    devices: { method: 'GET', path: '/api/devices', auth: true },
    rotateDeviceToken: {
      method: 'POST',
      path: (id) => `/api/devices/${id}/token/rotate`,
      auth: true,
    },
  },
  sessions: {
    list: { method: 'GET', path: '/api/sessions', auth: true },
    get: {
      method: 'GET',
      path: (id) => `/api/sessions/${id}`,
      auth: true,
    },
    messages: {
      method: 'GET',
      path: (id) => `/api/sessions/${id}/messages`,
      auth: true,
    },
    abort: {
      method: 'POST',
      path: (id) => `/api/sessions/${id}/abort`,
      auth: true,
    },
  },
  messages: {
    send: { method: 'POST', path: '/api/message/send', auth: true },
    receive: { method: 'POST', path: '/api/message/receive', auth: true },
    read: { method: 'POST', path: '/api/read_message', auth: true },
  },
  channels: {
    list: { method: 'GET', path: '/api/channels', auth: true },
    webhook: { method: 'POST', path: '/webhook', auth: false },
  },
  config: {
    list: { method: 'GET', path: '/api/config/list', auth: true },
    patch: { method: 'PATCH', path: '/api/config', auth: true },
    drift: { method: 'GET', path: '/api/config/drift', auth: true },
  },
  admin: {
    sopPending: { method: 'GET', path: '/admin/sop/pending', auth: true },
    sopApprove: { method: 'POST', path: '/admin/sop/approve', auth: true },
    sopDeny: { method: 'POST', path: '/admin/sop/deny', auth: true },
    reload: { method: 'POST', path: '/admin/reload', auth: true },
  },
  chatSocket: {
    path: (agent) => `/ws/chat${agent ? `?agent=${agent}` : ''}`,
    auth: true,
  },
};

export function buildUrl(endpoint, ...args) {
  const path = typeof endpoint.path === 'function'
    ? endpoint.path(...args)
    : endpoint.path;
  return `${GATEWAY_BASE_URL}${path}`;
}
