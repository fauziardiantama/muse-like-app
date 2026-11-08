// Placeholder / mockup chat, text only — no photo or video mockups yet
// (Farid, Oct 27). Covers every numbered style from his screenshots:
// 1 normal user, 2 normal AI, 3 double user + double AI, 6 replying chat.
// Typing (7), scroll button (4) and status (5) are components, not data.
export const PLACEHOLDER_MESSAGES = [
  { id: 'ph-long-ai', role: 'ai', text: 'This is a long AI message, so the list is tall enough to scroll. It wraps over several lines, just like a real answer, and lets you scroll up to see the scroll-to-bottom button work.' },
  { id: 'ph-user-normal', role: 'user', text: 'This is a normal user chat.' },
  { id: 'ph-ai-normal', role: 'ai', text: 'This is a normal AI chat.' },
  { id: 'ph-user-double-1', role: 'user', text: 'First message of a double user chat.' },
  { id: 'ph-user-double-2', role: 'user', text: 'Second message of a double user chat.' },
  { id: 'ph-ai-double-1', role: 'ai', text: 'First message of a double AI chat.' },
  { id: 'ph-ai-double-2', role: 'ai', text: 'Second message of a double AI chat.' },
  { id: 'ph-user-normal-2', role: 'user', text: 'This is another normal user chat.' },
  { id: 'ph-ai-reply-target', role: 'ai', text: 'This is the message being replied to, shown quoted above the reply.' },
  { id: 'ph-user-reply', role: 'user', text: 'This is a replying chat.', replyTo: { author: 'Ai-Chan', text: 'This is the message being replied to, shown quoted above the reply.' } },
  { id: 'ph-ai-gotit', role: 'ai', text: 'Got it.' },
];
