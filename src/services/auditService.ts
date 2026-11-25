import { AuditEvent } from '../types';
import { generateEventHash, verifyAuditChain } from '../lib/hashChain';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function createAuditEvent(
  applicationId: string,
  eventType: string,
  description: string,
  actor: { id: string; name: string; role: 'system' | 'admin' | 'reviewer' },
  existingEventsForApp: AuditEvent[],
  metadata?: Record<string, any>
): Promise<AuditEvent> {
  const sorted = [...existingEventsForApp].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const lastEvent = sorted[sorted.length - 1];
  const previousHash = lastEvent ? lastEvent.current_hash : GENESIS_HASH;
  const eventId = `aud_${applicationId.replace('app_', '')}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const currentHash = await generateEventHash(previousHash, {
    id: eventId,
    application_id: applicationId,
    event_type: eventType,
    description,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    timestamp,
    metadata
  });

  return {
    id: eventId,
    application_id: applicationId,
    event_type: eventType,
    description,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    previous_hash: previousHash,
    current_hash: currentHash,
    metadata,
    timestamp
  };
}

export async function verifyApplicationAuditTrail(events: AuditEvent[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return await verifyAuditChain(sorted);
}
