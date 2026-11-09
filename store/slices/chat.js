// store/slices/chat.js
// Chat slice. Connects to ZeroClaw WebSocket & REST endpoints.
// Persists main session per agent so returning to the chat page resumes
// the ongoing primary conversation rather than vivifying a new empty session.
import { getChatWebSocketUrl, getSessionMessages } from '../../api/client';

let activeSocket = null;

export function stripSystemTimestamp(content) {
  if (typeof content !== 'string') return '';
  return content.replace(/^\[CURRENT DATE & TIME:[^\]]+\]\n\n?/, '');
}

function setupChatWebSocket({ agent, sessionId, isMain = false, set }) {
  if (activeSocket) {
    try {
      activeSocket.onopen = null;
      activeSocket.onmessage = null;
      activeSocket.onerror = null;
      activeSocket.onclose = null;
      activeSocket.close();
    } catch {}
    activeSocket = null;
  }

  const wsUrl = getChatWebSocketUrl(agent, sessionId);
  try {
    const ws = new WebSocket(wsUrl);
    activeSocket = ws;

    ws.onopen = () => {
      if (activeSocket !== ws) return;
      set((s) => ({
        chat: { ...s.chat, wsStatus: 'connected', error: null },
      }));
    };

    ws.onmessage = (event) => {
      if (activeSocket !== ws) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'session_start') {
          const sid = data.session_id;
          set((s) => {
            const nextMain = { ...s.chat.mainSessionIds };
            if (isMain && !nextMain[agent]) {
              nextMain[agent] = sid;
            }
            return {
              chat: {
                ...s.chat,
                mainSessionIds: nextMain,
                activeSessionId: sid,
                wsStatus: 'connected',
              },
            };
          });
        } else if (data.type === 'chunk') {
          set((s) => {
            const messages = [...s.chat.messages];
            const lastIdx = messages.length - 1;
            const lastMsg = lastIdx >= 0 ? messages[lastIdx] : null;

            if (lastMsg && lastMsg.role === 'ai' && lastMsg._streaming) {
              messages[lastIdx] = {
                ...lastMsg,
                text: (lastMsg.text || '') + (data.content || ''),
              };
            } else {
              messages.push({
                id: `ai-stream-${Date.now()}`,
                role: 'ai',
                text: data.content || '',
                _streaming: true,
              });
            }
            return {
              chat: {
                ...s.chat,
                messages,
                isStreaming: true,
                wsStatus: 'streaming',
              },
            };
          });
        } else if (data.type === 'done') {
          set((s) => {
            const messages = [...s.chat.messages];
            const lastIdx = messages.length - 1;
            const lastMsg = lastIdx >= 0 ? messages[lastIdx] : null;

            if (lastMsg && lastMsg.role === 'ai') {
              messages[lastIdx] = {
                ...lastMsg,
                text: data.full_response || lastMsg.text,
                _streaming: false,
              };
            }
            return {
              chat: {
                ...s.chat,
                messages,
                isStreaming: false,
                wsStatus: 'connected',
              },
            };
          });
        } else if (data.type === 'error') {
          set((s) => ({
            chat: {
              ...s.chat,
              error: data.message || 'Error occurred during streaming',
              isStreaming: false,
              wsStatus: 'connected',
            },
          }));
        }
      } catch (err) {
        console.warn('[ChatSlice] Failed to parse WebSocket frame:', err);
      }
    };

    ws.onerror = (err) => {
      if (activeSocket !== ws) return;
      set((s) => ({
        chat: {
          ...s.chat,
          error: err?.message || 'WebSocket connection error',
          wsStatus: 'disconnected',
          isStreaming: false,
        },
      }));
    };

    ws.onclose = () => {
      if (activeSocket !== ws) return;
      set((s) => ({
        chat: {
          ...s.chat,
          wsStatus: 'disconnected',
          isStreaming: false,
        },
      }));
    };
  } catch (err) {
    set((s) => ({
      chat: {
        ...s.chat,
        error: err?.message || 'Failed to initialize WebSocket',
        wsStatus: 'disconnected',
        loading: false,
      },
    }));
  }
}

export const createChatSlice = (set, get) => ({
  chat: {
    messages: [],
    replyTo: null,
    mainSessionIds: {},
    activeSessionId: null,
    wsStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'streaming'
    isStreaming: false,
    loading: false,
    error: null,

    setReplyTo: (replyTo) => set((state) => ({
      chat: { ...state.chat, replyTo },
    })),

    initChat: async (targetAgent) => {
      // Ensure active token and baseUrl are synced to api/client
      get().connection?.syncClientConfig?.();

      const state = get();
      const agent = targetAgent || state.identity?.activeAgent || 'aichan';
      const mainSessionId = state.chat?.mainSessionIds?.[agent] || null;

      // Close previous connection if exists
      if (activeSocket) {
        try {
          activeSocket.onopen = null;
          activeSocket.onmessage = null;
          activeSocket.onerror = null;
          activeSocket.onclose = null;
          activeSocket.close();
        } catch {}
        activeSocket = null;
      }

      set((s) => ({
        chat: {
          ...s.chat,
          loading: true,
          wsStatus: 'connecting',
          error: null,
        },
      }));

      // If we have a saved main session, load previous messages first
      if (mainSessionId) {
        try {
          const res = await getSessionMessages(mainSessionId);
          const rawMsgs = res?.messages || [];
          const msgs = rawMsgs.map((m, idx) => ({
            id: `${mainSessionId}-${idx}`,
            role: m.role === 'assistant' ? 'ai' : m.role,
            text: stripSystemTimestamp(m.content),
            created_at: m.created_at,
          }));

          set((s) => ({
            chat: {
              ...s.chat,
              messages: msgs,
              activeSessionId: mainSessionId,
              loading: false,
            },
          }));
        } catch (err) {
          // If session not found on gateway, fallback to clean new chat
          set((s) => {
            const nextMain = { ...s.chat.mainSessionIds };
            delete nextMain[agent];
            return {
              chat: {
                ...s.chat,
                messages: [],
                activeSessionId: null,
                mainSessionIds: nextMain,
                loading: false,
              },
            };
          });
        }
      } else {
        // New chat: start with empty messages
        set((s) => ({
          chat: {
            ...s.chat,
            messages: [],
            activeSessionId: null,
            loading: false,
          },
        }));
      }

      // Connect WebSocket (with session_id if resumed, or without if new)
      const currentMain = get().chat.activeSessionId;
      setupChatWebSocket({ agent, sessionId: currentMain, isMain: true, set });
    },

    openSession: async (sessionId, agentAlias) => {
      get().connection?.syncClientConfig?.();
      const state = get();
      const agent = agentAlias || state.identity?.activeAgent || 'aichan';

      set((s) => ({
        chat: {
          ...s.chat,
          loading: true,
          wsStatus: 'connecting',
          activeSessionId: sessionId,
          error: null,
        },
      }));

      try {
        const res = await getSessionMessages(sessionId);
        const rawMsgs = res?.messages || [];
        const msgs = rawMsgs.map((m, idx) => ({
          id: `${sessionId}-${idx}`,
          role: m.role === 'assistant' ? 'ai' : m.role,
          text: stripSystemTimestamp(m.content),
          created_at: m.created_at,
        }));

        set((s) => ({
          chat: {
            ...s.chat,
            messages: msgs,
            activeSessionId: sessionId,
            loading: false,
          },
        }));
      } catch (err) {
        set((s) => ({
          chat: {
            ...s.chat,
            error: err?.message || 'Gagal memuat pesan sesi',
            loading: false,
          },
        }));
      }

      setupChatWebSocket({ agent, sessionId, isMain: false, set });
    },

    sendMessage: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const state = get();
      const { replyTo } = state.chat;
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        created_at: new Date().toISOString(),
        ...(replyTo ? { replyTo } : {}),
      };

      // Check socket readiness
      if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
        // Attempt sending or error
        set((s) => ({
          chat: {
            ...s.chat,
            error: 'WebSocket belum terhubung ke gateway',
          },
        }));
        return;
      }

      // Send payload to ZeroClaw Gateway
      try {
        activeSocket.send(JSON.stringify({ type: 'message', content: trimmed }));
      } catch (err) {
        set((s) => ({
          chat: { ...s.chat, error: `Gagal mengirim pesan: ${err.message}` },
        }));
        return;
      }

      set((s) => ({
        chat: {
          ...s.chat,
          messages: [...s.chat.messages, userMsg],
          replyTo: null,
          isStreaming: true,
          wsStatus: 'streaming',
          error: null,
        },
      }));
    },

    disconnectChat: () => {
      if (activeSocket) {
        try {
          activeSocket.close();
        } catch {}
        activeSocket = null;
      }
      set((s) => ({
        chat: { ...s.chat, wsStatus: 'disconnected', isStreaming: false },
      }));
    },

    newChat: async (targetAgent) => {
      const state = get();
      const agent = targetAgent || state.identity?.activeAgent || 'aichan';
      // Clear main session for this agent
      set((s) => {
        const nextMain = { ...s.chat.mainSessionIds };
        delete nextMain[agent];
        return {
          chat: {
            ...s.chat,
            mainSessionIds: nextMain,
            messages: [],
            activeSessionId: null,
          },
        };
      });
      // Re-init as clean new chat
      await get().chat.initChat(agent);
    },
  },
});
