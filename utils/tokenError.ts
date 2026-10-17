// Detects a JWT auth rejection (expired/invalid token) from the WordPress
// JWT Authentication plugin, as opposed to any other request failure. The
// plugin returns a 401/403 with a `code` like "jwt_auth_invalid_token" and/or
// a message mentioning "expired" - callers use this to distinguish "your
// session is gone, log in again" from a generic retryable error.
export function isExpiredTokenError(err: any): boolean {
  const status = err?.response?.status;
  if (status !== 401 && status !== 403) return false;

  const data = err?.response?.data;
  const code = String(data?.code || '').toLowerCase();
  const message = String(data?.message || err?.message || '').toLowerCase();

  return (
    code.includes('jwt_auth') ||
    code.includes('invalid_token') ||
    message.includes('expired') ||
    message.includes('token is invalid') ||
    message.includes('signature verification failed')
  );
}
