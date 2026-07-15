// Cache helpers and domain parsing utilities

export function getHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname;
  } catch {
    return '';
  }
}

export function getDomain(urlStr: string): string {
  try {
    const hostname = getHostname(urlStr);
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return '';
  }
}
