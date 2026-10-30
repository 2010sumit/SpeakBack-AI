import { createClient } from './server';
import { createAdminClient } from './admin';

export interface AuditLogEntry {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export async function recordAdminAuditLog({
  adminId,
  action,
  targetType,
  targetId = null,
  details = {},
  ipAddress = null,
}: AuditLogEntry) {
  try {
    // If service role key is available, use admin client to guarantee write permission;
    // otherwise use server client
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createAdminClient();
    } else {
      supabase = createClient();
    }

    const { error } = await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress,
    });

    if (error) {
      console.error('Failed to record admin audit log:', error.message);
    }
  } catch (err) {
    console.error('Error writing audit log entry:', err);
  }
}
