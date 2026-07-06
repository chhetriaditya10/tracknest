export function trackEvent(name, payload = {}) {
  try {
    if (typeof window !== 'undefined') {
      if (window.trackEvent && typeof window.trackEvent === 'function') {
        window.trackEvent(name, payload);
        return;
      }
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: name, ...payload });
        return;
      }
    }
  } catch (e) {
    // ignore errors to avoid breaking UI
  }
  // fallback: console for local development
  // keep non-sensitive payload
  // eslint-disable-next-line no-console
  console.info('Analytics event:', name, payload);
}
