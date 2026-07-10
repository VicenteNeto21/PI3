/**
 * Utilitário de Logging Estilizado para o Console do Navegador
 * Design limpo, sem excesso de ícones ou colchetes, estilo CLI moderno (Vite/Next.js)
 */

const createBadge = (bg, color = '#FFFFFF') =>
  `background: ${bg}; color: ${color}; font-weight: 600; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-family: 'Inter', system-ui, -apple-system, sans-serif;`;

const msgStyle = (color = 'inherit') =>
  `color: ${color}; font-size: 12px; font-family: 'Inter', system-ui, -apple-system, sans-serif;`;

const cleanMessage = (msg) => {
  if (typeof msg !== 'string') return msg;
  // Remove emojis redundantes no início da mensagem para evitar duplicação no console
  return msg.replace(/^(💬|🎉|⚡|🚨|✨|❌|✅|⚠️|🔄|👤|💾|🚪|✏️|⚙️|🌐)\s*/u, '');
};

export const logger = {
  info: (tag, message, ...args) => {
    console.log(
      `%cℹ️ ${tag.toUpperCase()}%c ${cleanMessage(message)}`,
      createBadge('#3B82F6'),
      msgStyle('#2563EB'),
      ...args
    );
  },

  success: (tag, message, ...args) => {
    console.log(
      `%c✨ ${tag.toUpperCase()}%c ${cleanMessage(message)}`,
      createBadge('#10B981'),
      msgStyle('#059669'),
      ...args
    );
  },

  warn: (tag, message, ...args) => {
    console.warn(
      `%c⚠️ ${tag.toUpperCase()}%c ${cleanMessage(message)}`,
      createBadge('#F59E0B', '#1E293B'),
      msgStyle('#D97706'),
      ...args
    );
  },

  error: (tag, message, ...args) => {
    console.error(
      `%c❌ ${tag.toUpperCase()}%c ${cleanMessage(message)}`,
      createBadge('#EF4444'),
      msgStyle('#DC2626'),
      ...args
    );
  },

  http: (method, url, status = null, timeMs = null, error = null) => {
    const isError = (status && status >= 400) || error !== null;
    const bg = isError ? '#EF4444' : '#8B5CF6';
    const icon = isError ? '✖' : '◆';
    const statusTxt = status ? ` • Status ${status}` : '';
    const timeTxt = timeMs ? ` (${timeMs}ms)` : '';
    const text = `${url}${statusTxt}${timeTxt}`;

    if (error) {
      console.error(
        `%c${icon} ${method.toUpperCase()}%c ${text}`,
        createBadge(bg),
        msgStyle(isError ? '#DC2626' : '#6D28D9'),
        error
      );
    } else {
      console.log(
        `%c${icon} ${method.toUpperCase()}%c ${text}`,
        createBadge(bg),
        msgStyle('#6D28D9')
      );
    }
  },

  auth: (action, message, ...args) => {
    const isError = action === 'ERRO' || action === 'FALHA';
    const bg = isError ? '#EF4444' : '#7E22CE';
    const icon = isError ? '❌' : '🔒';
    if (isError) {
      console.error(
        `%c${icon} AUTH: ${action.toUpperCase()}%c ${cleanMessage(message)}`,
        createBadge(bg),
        msgStyle('#DC2626'),
        ...args
      );
    } else {
      console.log(
        `%c${icon} AUTH: ${action.toUpperCase()}%c ${cleanMessage(message)}`,
        createBadge(bg),
        msgStyle('#7E22CE'),
        ...args
      );
    }
  }
};
