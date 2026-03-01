// Shared in-memory session store
// All auth routes import from here so they share the same Map instance
// In production, replace with Redis or database sessions

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

// Use globalThis to survive hot-reloads in development
const globalSessions = globalThis as unknown as {
  __sessions?: Map<string, SessionUser>;
};

if (!globalSessions.__sessions) {
  globalSessions.__sessions = new Map<string, SessionUser>();
}

export const sessions: Map<string, SessionUser> = globalSessions.__sessions;
