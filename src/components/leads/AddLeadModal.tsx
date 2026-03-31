import { useState } from 'react';
import type { Lead, LeadStatus, Platform, City } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { PLATFORMS, CITIES, STATUSES } from '@/utils/constants';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (lead: Partial<Lead>) => Promise<void>;
}

export function AddLeadModal({ isOpen, onClose, onCreate }: AddLeadModalProps) {
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    jobAdUrl: '',
    platform: 'seek' as Platform,
    city: 'Melbourne' as City,
    datePosted: new Date().toISOString().split('T')[0],
    contactName: '',
    contactEmail: '',
    status: 'new' as LeadStatus,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate({
        ...form,
        contactName: form.contactName || null,
        contactEmail: form.contactEmail || null,
      });
      onClose();
      setForm({ companyName: '', jobTitle: '', jobAdUrl: '', platform: 'seek', city: 'Melbourne', datePosted: new Date().toISOString().split('T')[0], contactName: '', contactEmail: '', status: 'new' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';
  const labelCls = 'mb-1 block text-xs font-medium text-muted-foreground';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lead Manually">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Company Name *</label><input className={inputCls} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required /></div>
          <div><label className={labelCls}>Job Title *</label><input className={inputCls} value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required /></div>
          <div><label className={labelCls}>Job Ad URL *</label><input className={inputCls} value={form.jobAdUrl} onChange={(e) => setForm({ ...form, jobAdUrl: e.target.value })} required /></div>
          <div><label className={labelCls}>Date Posted</label><input type="date" className={inputCls} value={form.datePosted} onChange={(e) => setForm({ ...form, datePosted: e.target.value })} /></div>
          <div><label className={labelCls}>Platform</label><select className={inputCls} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className={labelCls}>City</label><select className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value as City })}>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={labelCls}>Contact Name</label><input className={inputCls} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div>
          <div><label className={labelCls}>Contact Email</label><input type="email" className={inputCls} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">{loading ? 'Adding...' : 'Add Lead'}</button>
        </div>
      </form>
    </Modal>
  );
}
