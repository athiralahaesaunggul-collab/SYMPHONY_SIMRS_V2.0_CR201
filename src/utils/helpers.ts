/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates exact age in years from a birthdate (YYYY-MM-DD)
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * Generates a unique, professional 6-digit Medical Record (No. RM) number: e.g., "12-34-56"
 */
export function generateMedicalRecordNumber(existingNumbers: string[]): string {
  let maxNum = 0;
  existingNumbers.forEach(num => {
    if (num && num.startsWith('RM-')) {
      const seqStr = num.substring(3);
      const sequence = parseInt(seqStr, 10);
      if (!isNaN(sequence) && sequence > maxNum) {
        maxNum = sequence;
      }
    }
  });
  
  const nextNum = maxNum + 1;
  return `RM-${String(nextNum).padStart(4, '0')}`;
}

/**
 * Generates a random physical archive shelf code (e.g. "RAK-A-304")
 */
export function generateRakCode(): string {
  const letters = 'ABCDEFGH';
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNumber = String(Math.floor(Math.random() * 900) + 100); // 100 to 999
  return `RAK-${randomLetter}-${randomNumber}`;
}

/**
 * Returns formatted current timestamp for security audit trail (e.g. "2026-07-02 14:23:45")
 */
export function getCurrentTimestamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * Simple Base64 Encoder/Decoder helpers for simulated JWT tokens
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Signs a simulated JWT token using Header, Payload, and a fake secret signature
 */
export function signSimulatedJWT(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({ ...payload, exp: Date.now() + 2 * 60 * 60 * 1000 })); // 2 hours exp
  const signature = base64UrlEncode(`symphony-secret-key-321-esa-unggul-${encodedHeader}.${encodedPayload}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Decodes and verifies a simulated JWT token. Returns payload or null if invalid/expired.
 */
export function verifySimulatedJWT(token: string): any | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerStr, payloadStr, signature] = parts;
    
    // Validate signature authenticity (simulated check)
    const expectedSignature = base64UrlEncode(`symphony-secret-key-321-esa-unggul-${headerStr}.${payloadStr}`);
    if (signature !== expectedSignature) {
      console.warn('JWT signature mismatch!');
      return null;
    }
    
    const payload = JSON.parse(base64UrlDecode(payloadStr));
    if (payload.exp && Date.now() > payload.exp) {
      console.warn('JWT token expired!');
      return null;
    }
    
    return payload;
  } catch (err) {
    console.error('JWT decoding error', err);
    return null;
  }
}
