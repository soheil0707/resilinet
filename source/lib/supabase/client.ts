// Supabase Client (Deprecated - Operational data source migrated to SAP HANA Cloud)
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Phase 34: SAP HANA Cloud is the authoritative Single Source of Truth for all ResiliNet data.
 * Active operational Supabase queries = 0.
 */
export function isSupabaseConfigured(): boolean {
  return false;
}

export function createClient(): SupabaseClient | null {
  return null;
}
