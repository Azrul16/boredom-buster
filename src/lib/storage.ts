export function readStore<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const value = localStorage.getItem(`timepass_${key}`);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}
export function writeStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(`timepass_${key}`, JSON.stringify(value));
  } catch {
    /* Private browsing and full storage must not interrupt play. */
  }
}
