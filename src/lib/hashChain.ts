/**
 * SHA-256 Hash Chain Utility for Audit Log Tamper Evident Integrity
 */

export async function computeSHA256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple checksum if subtle crypto is unavailable
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16).padStart(16, '0');
}

export interface HashChainItem {
  id: string;
  application_id: string;
  event_type: string;
  description: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  previous_hash: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export async function generateEventHash(
  previousHash: string,
  event: Omit<HashChainItem, 'previous_hash'>
): Promise<string> {
  const payload = JSON.stringify({
    previous_hash: previousHash,
    id: event.id,
    application_id: event.application_id,
    event_type: event.event_type,
    description: event.description,
    actor_id: event.actor_id,
    timestamp: event.timestamp,
    metadata: event.metadata || {}
  });

  return await computeSHA256(payload);
}

export async function verifyAuditChain(
  events: Array<HashChainItem & { current_hash: string }>
): Promise<{ isValid: boolean; brokenAtIndex?: number; error?: string }> {
  if (!events || events.length === 0) return { isValid: true };

  const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  let expectedPrev = GENESIS_HASH;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.previous_hash !== expectedPrev) {
      return {
        isValid: false,
        brokenAtIndex: i,
        error: `Previous hash mismatch at event ${ev.id}: expected ${expectedPrev.slice(0, 10)}... but found ${ev.previous_hash.slice(0, 10)}...`
      };
    }

    const calculatedHash = await generateEventHash(ev.previous_hash, ev);
    if (calculatedHash !== ev.current_hash) {
      return {
        isValid: false,
        brokenAtIndex: i,
        error: `Content hash mismatch at event ${ev.id}: content has been modified!`
      };
    }

    expectedPrev = ev.current_hash;
  }

  return { isValid: true };
}
