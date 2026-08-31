import * as SecureStore from 'expo-secure-store';

const PUBLISHABLE_KEY = 'pk_test_aW5maW5pdGUtZ29iYmxlci01OC5jbGVyay5hY2NvdW50cy5kZXYk';
const FRONTEND_API = 'https://infinite-gobbler-58.clerk.accounts.dev';

const SESSION_TOKEN_KEY = '@clerk_session_token';
const SESSION_JWT_KEY = '@clerk_session_jwt';
const SESSION_ID_KEY = '@clerk_session_id';

function clerkHeaders(sessionToken?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'x-publishable-key': PUBLISHABLE_KEY,
  };
  if (sessionToken) {
    h['clerk-session'] = sessionToken;
  }
  return h;
}

async function clerkFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${FRONTEND_API}${path}`, init);
  if (!res.ok) {
    let msg = `Clerk API ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.errors?.[0]?.message || body?.errors?.[0]?.long_message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res;
}

export async function signInWithEmail(email: string): Promise<{
  signInId: string;
  status: string;
}> {
  const res = await clerkFetch('/v1/client/sign-ins', {
    method: 'POST',
    headers: clerkHeaders(),
    body: `identifier=${encodeURIComponent(email)}`,
  });
  const data = await res.json();
  return {
    signInId: data.response?.id || data.id,
    status: data.response?.status || data.status,
  };
}

export async function signInWithPassword(
  signInId: string,
  password: string
): Promise<{
  status: string;
  createdSessionId: string | null;
  sessionToken: string | null;
}> {
  const res = await clerkFetch(`/v1/client/sign-ins/${signInId}/attempt_first_factor`, {
    method: 'POST',
    headers: clerkHeaders(),
    body: `strategy=password&password=${encodeURIComponent(password)}`,
  });

  const sessionToken = res.headers.get('clerk-session');
  const data = await res.json();
  const response = data.response || data;

  return {
    status: response.status,
    createdSessionId: response.created_session_id || null,
    sessionToken: sessionToken,
  };
}

export async function getSessionJWT(
  sessionId: string,
  sessionToken: string
): Promise<string | null> {
  const res = await clerkFetch('/v1/client/sessions', {
    method: 'GET',
    headers: clerkHeaders(sessionToken),
  });
  const data = await res.json();
  const sessions = data.response || data.data || data;

  if (Array.isArray(sessions)) {
    const match = sessions.find((s: any) => s.id === sessionId);
    if (match?.last_active_token?.jwt) return match.last_active_token.jwt;
    if (match?.lastActiveToken?.jwt) return match.lastActiveToken.jwt;
  }
  return null;
}

export async function getSessionToken(
  sessionId: string,
  sessionToken: string
): Promise<string | null> {
  try {
    const res = await clerkFetch(`/v1/client/sessions/${sessionId}/tokens`, {
      method: 'POST',
      headers: clerkHeaders(sessionToken),
    });
    const data = await res.json();
    return data.jwt || data.token || null;
  } catch {
    return null;
  }
}

export async function clerkSignOut(sessionToken: string | null): Promise<void> {
  if (!sessionToken) return;
  try {
    await clerkFetch('/v1/client/sign-outs', {
      method: 'POST',
      headers: clerkHeaders(sessionToken),
    });
  } catch {}
}

export async function storeSession(
  sessionToken: string,
  sessionId: string,
  jwt: string
): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken);
  await SecureStore.setItemAsync(SESSION_ID_KEY, sessionId);
  await SecureStore.setItemAsync(SESSION_JWT_KEY, jwt);
}

export async function loadStoredSession(): Promise<{
  sessionToken: string;
  sessionId: string;
  jwt: string;
} | null> {
  try {
    const sessionToken = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    const sessionId = await SecureStore.getItemAsync(SESSION_ID_KEY);
    const jwt = await SecureStore.getItemAsync(SESSION_JWT_KEY);
    if (sessionToken && sessionId && jwt) {
      return { sessionToken, sessionId, jwt };
    }
  } catch {}
  return null;
}

export async function clearStoredSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_ID_KEY);
    await SecureStore.deleteItemAsync(SESSION_JWT_KEY);
  } catch {}
}

export { PUBLISHABLE_KEY };
