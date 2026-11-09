// store/slices/identity.js
// Identity slice. Holds SOUL, IDENTITY, USER, and human-friendly display names
// for agents. Display names are stored canonically inside the agent's IDENTITY.md
// (- **Name:** <DisplayName>) which ZeroClaw automatically moves when an agent is renamed.
import {
  getPersonalityFile,
  putPersonalityFile,
  renameMapKey,
} from '../../api/client';

export function parseDisplayNameFromIdentity(content, fallback = 'Ai-Chan') {
  if (!content || typeof content !== 'string') return fallback;

  // 1. Cocokkan "- **Name:** Name" atau "- Name: Name"
  const nameMatch = content.match(/^-\s+\*\*Name:\*\*\s*(.+)$/im) ||
                    content.match(/^-\s+Name:\s*(.+)$/im);
  if (nameMatch && nameMatch[1]?.trim()) {
    return nameMatch[1].trim();
  }

  // 2. Cocokkan heading jika bukan "# IDENTITY.md"
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch && headingMatch[1]?.trim()) {
    const heading = headingMatch[1].trim();
    if (!heading.toLowerCase().includes('identity.md') && !heading.toLowerCase().includes('who am i')) {
      return heading;
    }
  }

  return fallback;
}

export function updateDisplayNameInIdentity(content, newDisplayName) {
  const cleanName = (newDisplayName || '').trim() || 'Ai-Chan';
  if (!content || typeof content !== 'string') {
    return `# IDENTITY.md — Who Am I?\n\n- **Name:** ${cleanName}\n- **Creature:** A Rust-forged AI — fast, lean, and relentless\n- **Emoji:** 🌸\n\n---\n\nUpdate this file as you evolve. Your identity is yours to shape.\n`;
  }

  if (/^-\s+\*\*Name:\*\*\s*.*$/im.test(content)) {
    return content.replace(/^-\s+\*\*Name:\*\*\s*.*$/im, `- **Name:** ${cleanName}`);
  }
  if (/^-\s+Name:\s*.*$/im.test(content)) {
    return content.replace(/^-\s+Name:\s*.*$/im, `- **Name:** ${cleanName}`);
  }

  const lines = content.split('\n');
  const headingIdx = lines.findIndex((l) => l.startsWith('#'));
  if (headingIdx !== -1) {
    lines.splice(headingIdx + 1, 0, '', `- **Name:** ${cleanName}`);
    return lines.join('\n');
  }

  return `- **Name:** ${cleanName}\n\n${content}`;
}

export const createIdentitySlice = (set, get) => ({
  identity: {
    activeAgent: 'aichan',
    displayName: 'Ai-Chan',
    displayNames: { aichan: 'Ai-Chan' },
    soul: '',
    identity: '',
    user: '',
    loading: false,
    error: null,

    setActiveAgent: (activeAgent) => {
      const sanitized = (activeAgent || '').trim() || 'aichan';
      set((state) => ({
        identity: {
          ...state.identity,
          activeAgent: sanitized,
          displayName: state.identity.displayNames[sanitized] || sanitized,
        },
      }));
      get().identity.loadIdentity(sanitized);
    },

    setDisplayName: (displayName, agentName) => set((state) => {
      const target = agentName || state.identity.activeAgent || 'aichan';
      const cleanName = (displayName || '').trim() || target;
      return {
        identity: {
          ...state.identity,
          displayName: target === state.identity.activeAgent ? cleanName : state.identity.displayName,
          displayNames: {
            ...state.identity.displayNames,
            [target]: cleanName,
          },
        },
      };
    }),

    setSoul: (soul) => set((state) => ({
      identity: { ...state.identity, soul },
    })),

    setIdentity: (identity) => set((state) => ({
      identity: { ...state.identity, identity },
    })),

    setUser: (user) => set((state) => ({
      identity: { ...state.identity, user },
    })),

    // Load IDENTITY.md secara non-blocking di latar belakang
    loadIdentity: async (agentName) => {
      const targetAgent = agentName ||
                          get().identity.activeAgent ||
                          get().onboarding?.stateData?.agents?.[0] ||
                          'aichan';

      set((state) => ({
        identity: { ...state.identity, loading: true, error: null },
      }));

      try {
        const res = await getPersonalityFile('IDENTITY.md', targetAgent);
        const rawContent = res?.content || '';
        const fallbackName = get().identity.displayNames?.[targetAgent] ||
                             (targetAgent === 'aichan' ? 'Ai-Chan' : targetAgent);
        const resolvedName = parseDisplayNameFromIdentity(rawContent, fallbackName);

        set((state) => ({
          identity: {
            ...state.identity,
            activeAgent: targetAgent,
            displayName: resolvedName,
            displayNames: {
              ...state.identity.displayNames,
              [targetAgent]: resolvedName,
            },
            identity: rawContent,
            loading: false,
            error: null,
          },
        }));

        return resolvedName;
      } catch (err) {
        // Toleran terhadap network timeout/offline: pertahankan cache yang sudah ada
        set((state) => ({
          identity: {
            ...state.identity,
            loading: false,
            error: err?.message || 'Gagal memuat berkas identitas agen',
          },
        }));
        return get().identity.displayName;
      }
    },

    // Simpan display name bebas ke berkas IDENTITY.md agen di ZeroClaw
    saveDisplayName: async (newDisplayName, agentName) => {
      const targetAgent = agentName || get().identity.activeAgent || 'aichan';
      const cleanName = (newDisplayName || '').trim() || targetAgent;

      set((state) => ({
        identity: { ...state.identity, loading: true, error: null },
      }));

      try {
        let currentContent = get().identity.identity;
        if (!currentContent) {
          try {
            const fetched = await getPersonalityFile('IDENTITY.md', targetAgent);
            currentContent = fetched?.content || '';
          } catch {}
        }

        const updatedContent = updateDisplayNameInIdentity(currentContent, cleanName);
        await putPersonalityFile('IDENTITY.md', updatedContent, targetAgent);

        set((state) => ({
          identity: {
            ...state.identity,
            displayName: cleanName,
            displayNames: {
              ...state.identity.displayNames,
              [targetAgent]: cleanName,
            },
            identity: updatedContent,
            loading: false,
            error: null,
          },
        }));

        return cleanName;
      } catch (err) {
        set((state) => ({
          identity: {
            ...state.identity,
            loading: false,
            error: err?.message || 'Gagal menyimpan nama display agen',
          },
        }));
        throw err;
      }
    },

    // Rename agent alias key di ZeroClaw dan migrasikan display name cache
    renameAgent: async (fromAlias, toAlias) => {
      const from = (fromAlias || '').trim();
      const to = (toAlias || '').trim();
      if (!from || !to) throw new Error('From and To alias wajib diisi');

      set((state) => ({
        identity: { ...state.identity, loading: true, error: null },
      }));

      try {
        await renameMapKey('agents', from, to);

        set((state) => {
          const currentDisplayMap = { ...(state.identity.displayNames || {}) };
          const existingDisplayName = currentDisplayMap[from] ||
                                      (from === state.identity.activeAgent ? state.identity.displayName : from);
          delete currentDisplayMap[from];
          currentDisplayMap[to] = existingDisplayName;

          const isActive = state.identity.activeAgent === from;
          return {
            identity: {
              ...state.identity,
              activeAgent: isActive ? to : state.identity.activeAgent,
              displayName: isActive ? existingDisplayName : state.identity.displayName,
              displayNames: currentDisplayMap,
              loading: false,
              error: null,
            },
          };
        });
      } catch (err) {
        set((state) => ({
          identity: {
            ...state.identity,
            loading: false,
            error: err?.message || 'Gagal mengubah nama kunci agen',
          },
        }));
        throw err;
      }
    },
  },
});
