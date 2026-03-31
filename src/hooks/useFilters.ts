import { create } from 'zustand';
import type { LeadFilters } from '@/types';

interface FiltersState {
  filters: LeadFilters;
  setFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void;
  clearFilters: () => void;
}

const defaultFilters: LeadFilters = {
  platform: 'all',
  city: 'all',
  status: 'all',
  enrichmentStatus: 'all',
  followUpOnly: false,
  search: '',
  dateFrom: '',
  dateTo: '',
};

export const useFilters = create<FiltersState>((set) => ({
  filters: { ...defaultFilters },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: { ...defaultFilters } }),
}));
