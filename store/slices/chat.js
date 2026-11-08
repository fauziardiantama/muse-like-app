// store/slices/chat.js
// Chat slice. Owns messages and reply target only.
// Send behaviour is unchanged from ChatScreen's local version:
// trim, append a user message, clear reply target. No gateway call
// yet — the server is undecided, so wiring send to a gateway now
// would break the installed app.
import { PLACEHOLDER_MESSAGES } from '../../components/placeholderChat';

export const createChatSlice = (set) => ({
  chat: {
    messages: PLACEHOLDER_MESSAGES,
    replyTo: null,
    sendMessage: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      set((state) => {
        const { messages, replyTo } = state.chat;
        return {
          chat: {
            ...state.chat,
            messages: [
              ...messages,
              {
                id: String(Date.now()),
                role: 'user',
                text: trimmed,
                ...(replyTo ? { replyTo } : {}),
              },
            ],
            replyTo: null,
          },
        };
      });
    },
    setReplyTo: (replyTo) => set((state) => ({
      chat: { ...state.chat, replyTo },
    })),
  },
});
