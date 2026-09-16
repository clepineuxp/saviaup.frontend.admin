import { AdminSession } from '../models/admin.models';

export const ADMIN_SESSION_KEY = 'saviaup.admin.session';

export function readAdminSession(): AdminSession | null {
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed.accessToken || new Date(parsed.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}
