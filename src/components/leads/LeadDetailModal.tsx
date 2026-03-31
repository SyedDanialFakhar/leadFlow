import { useState } from 'react';
import type { Lead, LeadStatus } from '@/types';
import { StatusBadge } from '@/components/leads/LeadStatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatDate, daysSincePosted } from '@/utils/dateUtils';
import { STATUSES } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { ExternalLink, Mail, Phone, Linkedin, AlertTriangle } from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>;
}

export function LeadDetailModal({ lead, isOpen, onClose, onUpdate }: LeadDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!lead) return null;

  const handleStatusChange = async (status: LeadStatus) => {
    setUpdating(true);
    try {
      await onUpdate(lead.id, { status });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead.companyName} size="lg">
      <div className="space-y-6">
        {/* Warnings */}
        {lead.noAgencyDisclaimer && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" /> No agency disclaimer detected
          </div>
        )}
        {lead.isRecruitmentAgency && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="h-4 w-4" /> Likely a recruitment agency
          </div>
        )}

        {/* Job info */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Job Title" value={lead.jobTitle} />
          <Field label="Date Posted" value={`${formatDate(lead.datePosted)} (${daysSincePosted(lead.datePosted)}d ago)`} />
          <Field label="Platform" value={lead.platform} />
          <Field label="City" value={lead.city} />
          <Field label="Applicants" value={lead.applicantCount?.toString() ?? '—'} />
          <Field label="Company Size" value={lead.companyEmployeeCount ?? '—'} />
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={lead.contactName ?? '—'} />
            <Field label="Title" value={lead.contactJobTitle ?? '—'} />
            {lead.contactEmail && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-primary">{lead.contactEmail}</span>
              </div>
            )}
            {lead.contactPhone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{lead.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2">
          <a href={lead.jobAdUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
            <ExternalLink className="h-3 w-3" /> View Job Ad
          </a>
          {lead.contactLinkedinUrl && (
            <a href={lead.contactLinkedinUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
              <Linkedin className="h-3 w-3" /> LinkedIn
            </a>
          )}
        </div>

        {/* Status / Enrichment */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Status: </span>
            <StatusBadge status={lead.status} />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Enrichment: </span>
            <StatusBadge status={lead.enrichmentStatus} type="enrichment" />
          </div>
          {lead.followUpRequired && (
            <span className="text-xs font-medium text-warning">Follow-up needed</span>
          )}
        </div>

        {/* Status change */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Change Status</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating || lead.status === s}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  lead.status === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        {lead.opsComments && <Field label="Ops Comments" value={lead.opsComments} />}
        {lead.charlieFeedback && <Field label="Charlie Feedback" value={lead.charlieFeedback} />}
      </div>
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
