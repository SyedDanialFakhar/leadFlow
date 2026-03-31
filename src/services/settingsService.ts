import { supabase } from '@/lib/supabaseClient';

const settingsCache = new Map<string, string>();

export async function getSetting(key: string): Promise<string | null> {
  if (settingsCache.has(key)) return settingsCache.get(key)!;

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    settingsCache.set(key, data.value);
    return data.value;
  } catch {
    return null;
  }
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(`Failed to save setting: ${error.message}`);
  settingsCache.set(key, value);
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) throw new Error(`Failed to fetch settings: ${error.message}`);

  const result: Record<string, string> = {};
  (data ?? []).forEach((row) => {
    result[row.key] = row.value;
    settingsCache.set(row.key, row.value);
  });
  return result;
}

export function clearSettingsCache() {
  settingsCache.clear();
}
