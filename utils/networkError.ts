// A request that never reached the server (no response object) is a
// connectivity/network failure; anything else is a real API/server error.
// Used instead of a pre-flight NetInfo check, which was unreliable on iOS
// cold start (isInternetReachable can be null for several seconds) and
// caused screens to report "offline" before ever attempting a request.
export function isNetworkError(err: any): boolean {
  return !!err && !err.response && (
    err.message === 'Network Error' ||
    err.message === 'Network request failed' ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_NETWORK'
  );
}

// A Cloudflare/WAF bot-challenge or rate-limit block comes back as a 403 (or
// 429) carrying an HTML page, not the API's JSON envelope. A genuine auth
// rejection, by contrast, is JSON with a `code`/`message`. These blocks are
// transient - the request never reached WordPress - so we can safely retry
// them and, if they persist, show a friendly message instead of leaking "403".
export function isWafBlockError(err: any): boolean {
  const status = err?.response?.status;
  if (status !== 403 && status !== 429) return false;
  const data = err?.response?.data;
  if (data && typeof data === 'object' && (data.code || data.message)) return false;
  return true;
}

// Anything worth retrying with a short backoff: a network drop, a WAF/rate
// block, a timeout, or a 5xx from the origin.
export function isTransientServerError(err: any): boolean {
  if (isNetworkError(err) || isWafBlockError(err)) return true;
  const status = err?.response?.status;
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Turns any thrown error (axios, WAF HTML page, network drop) into a message
// that is safe to show a user - never a raw status code or HTML.
export function getFriendlyErrorMessage(
  err: any,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (isNetworkError(err)) {
    return 'You appear to be offline. Please check your connection and try again.';
  }

  const status = err?.response?.status;

  if (isWafBlockError(err)) {
    return 'Our servers are a little busy right now. Please try again in a moment.';
  }
  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (status >= 500 && status <= 599) {
    return 'Our servers are having trouble right now. Please try again shortly.';
  }

  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    const cleaned = stripTags(apiMessage);
    if (cleaned && !/status code\s*\d{3}/i.test(cleaned)) return cleaned;
  }

  const message = err?.message;
  if (
    typeof message === 'string' &&
    message.trim() &&
    !/status code\s*\d{3}/i.test(message) &&
    !/<html|<!doctype/i.test(message)
  ) {
    return message;
  }

  return fallback;
}
