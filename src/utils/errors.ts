const ERROR_PREFIX = /^(configuration error|validation error|unauthorized|not found|internal error):\s*/i;

export const toUserMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) {
      return message.replace(ERROR_PREFIX, '').trim() || fallback;
    }
  }

  return fallback;
};
