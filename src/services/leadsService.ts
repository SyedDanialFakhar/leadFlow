import { supabase } from '@/lib/supabaseClient';
import type { Lead, LeadStats } from '@/types';
import { dbRowToLead, leadToDbRow } from '@/utils/mappers';
import { todayISO } from '@/utils/dateUtils';

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch leads: ${error.message}`);
  return (data ?? []).map((row) => dbRowToLead(row as Record<string, unknown>));
}

export async function fetchLeadStats(): Promise<LeadStats> {
  const leads = await fetchLeads();
  const today = todayISO();

  return {
    total: leads.length,
    newToday: leads.filter((l) => l.createdAt.startsWith(today)).length,
    awaitingEnrichment: leads.filter((l) => l.enrichmentStatus === 'pending').length,
    followUpNeeded: leads.filter((l) => l.followUpRequired && !l.emailSent).length,
    accepted: leads.filter((l) => l.status === 'accepted').length,
    rejected: leads.filter((l) => l.status === 'rejected').length,
    called: leads.filter((l) => l.status === 'called').length,
  };
}

export async function createLead(lead: Partial<Lead>): Promise<Lead> {
  const dbRow = leadToDbRow(lead);
  const { data, error } = await supabase
    .from('leads')
    .insert(dbRow)
    .select()
    .single();

  if (error) throw new Error(`Failed to create lead: ${error.message}`);
  return dbRowToLead(data as Record<string, unknown>);
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  // Automatic follow-up logic: IF status = called AND no email sent yet AND email exists THEN follow_up_required = true
  if (updates.status === 'called' || (updates as any).enrichmentStatus === 'enriched' || updates.contactEmail) {
    const { data: current } = await supabase.from('leads').select('email_sent, contact_email, follow_up_required').eq('id', id).single();
    if (current && !current.email_sent && (updates.contactEmail || current.contact_email)) {
      if (updates.status === 'called') {
        updates.followUpRequired = true;
      }
    }
  }

  const dbRow = leadToDbRow(updates);
  const { data, error } = await supabase
    .from('leads')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update lead: ${error.message}`);
  return dbRowToLead(data as Record<string, unknown>);
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete lead: ${error.message}`);
}

export async function bulkUpdateLeadStatus(ids: string[], status: Lead['status']): Promise<void> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  
  if (status === 'called') {
    // For bulk updates, we'll set follow_up_required if an email exists and hasn't been sent
    // Note: This is a simpler version for bulk to avoid complex joins in a single update
    const { error } = await supabase
      .from('leads')
      .update({ 
        status, 
        follow_up_required: true,
        updated_at: new Date().toISOString() 
      })
      .in('id', ids)
      .eq('email_sent', false)
      .not('contact_email', 'is', null);
      
    if (error) throw new Error(`Failed to bulk update: ${error.message}`);
    return;
  }

  const { error } = await supabase
    .from('leads')
    .update(updates)
    .in('id', ids);

  if (error) throw new Error(`Failed to bulk update: ${error.message}`);
}

export async function insertScrapedLeads(leads: Partial<Lead>[]): Promise<number> {
  const rows = leads.map((l) => leadToDbRow(l));
  const { data, error } = await supabase
    .from('leads')
    .upsert(rows, { onConflict: 'job_ad_url', ignoreDuplicates: true })
    .select();

  if (error) throw new Error(`Failed to insert scraped leads: ${error.message}`);
  return data?.length ?? 0;
}
