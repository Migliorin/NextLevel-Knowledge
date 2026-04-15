const CHAT_CACHE_PREFIX = "chat_history:";

export const defaultChatMessages = [
  {
    role: "assistant",
    content: "Escolha um PDF e envie uma pergunta para iniciar a conversa.",
  },
];

function getChatCacheKey(documentId) {
  return `${CHAT_CACHE_PREFIX}${documentId}`;
}

export function getChatHistory(documentId) {
  if (!documentId) {
    return defaultChatMessages;
  }

  try {
    const cachedHistory = window.sessionStorage.getItem(getChatCacheKey(documentId));
    return cachedHistory ? JSON.parse(cachedHistory) : defaultChatMessages;
  } catch {
    return defaultChatMessages;
  }
}

export function saveChatHistory(documentId, messages) {
  if (!documentId) {
    return;
  }

  window.sessionStorage.setItem(getChatCacheKey(documentId), JSON.stringify(messages));
}

export function clearChatHistoryCache() {
  Object.keys(window.sessionStorage)
    .filter((key) => key.startsWith(CHAT_CACHE_PREFIX))
    .forEach((key) => window.sessionStorage.removeItem(key));
}
