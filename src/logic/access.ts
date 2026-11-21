const accessKey = 'grammar-os-access-v1';
const accessDigest = '0ad268189c6574298b4364b47bdf429044cac90edefe733cace2af2567ed0b54';

export async function isAccessCodeValid(code: string): Promise<boolean> {
  const encoded = new TextEncoder().encode(code.trim().toUpperCase());
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') === accessDigest;
}

export function hasGameAccess(): boolean {
  try {
    return localStorage.getItem(accessKey) === accessDigest;
  } catch {
    return false;
  }
}

export function rememberGameAccess(unlocked: boolean) {
  try {
    if (unlocked) localStorage.setItem(accessKey, accessDigest);
    else localStorage.removeItem(accessKey);
  } catch {
    // Keep the current tab usable when browser storage is unavailable.
  }
}

export function watchGameAccess(update: (unlocked: boolean) => void) {
  const sync = (event: StorageEvent) => {
    if (event.key === accessKey || event.key === null) update(hasGameAccess());
  };
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
}
