// Sesión firmada (HMAC) para evitar la falsificación de la cookie `user_session`.
// Usa Web Crypto (crypto.subtle) para ser compatible con Edge (proxy.js) y Node.
import { NextResponse } from 'next/server';

const SECRET =
  process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn(
    '[session] SESSION_SECRET no configurado: usando secreto por defecto INSEGURO.'
  );
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let keyPromise = null;
function getKey() {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }
  return keyPromise;
}

function b64urlEncode(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function createSession(payload) {
  const data = encoder.encode(JSON.stringify(payload));
  const key = await getKey();
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
  return `${b64urlEncode(data)}.${b64urlEncode(sig)}`;
}

export async function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  try {
    const [dataB64, sigB64] = token.split('.');
    const data = b64urlDecode(dataB64);
    const sig = b64urlDecode(sigB64);
    const key = await getKey();
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!valid) return null;
    return JSON.parse(decoder.decode(data));
  } catch {
    return null;
  }
}

// Devuelve una NextResponse (401) si no hay sesión admin; null si está autorizado.
export async function requireAdmin(request) {
  const cookie = request.cookies.get('user_session');
  const payload = cookie ? await verifySession(cookie.value) : null;
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  return null;
}
