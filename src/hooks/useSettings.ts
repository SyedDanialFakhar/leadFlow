import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllSettings, saveSetting } from '@/services/settingsService';

export function useSettings() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['settings'],
    queryFn: getAllSettings,
  });

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => saveSetting(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  return {
    settings: query.data ?? {},
    isLoading: query.isLoading,
    saveSetting: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
