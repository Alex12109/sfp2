/** Sitzungsspeicher mit Fehlertoleranz: blockierter Speicher darf die Seite nicht stören. */
export function read<T = unknown>(key: string, fallback: T | null = null): T | null {
  try {
    return (JSON.parse(sessionStorage.getItem(key) as string) as T) ?? fallback;
  } catch {
    return fallback;
  }
}
export function write(key: string, value: unknown): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
