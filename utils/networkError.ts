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
