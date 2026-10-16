import { Prisma } from '@prisma/client';

type AuditLogStore = Pick<Prisma.TransactionClient, 'auditLog'>;

export interface AuditLogEntry {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
}

export function recordAuditLog(store: AuditLogStore, entry: AuditLogEntry) {
  return store.auditLog.create({
    data: {
      ...entry,
      ipAddress: entry.ipAddress || null,
      details: entry.details || null,
    },
  });
}
