import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ChevronRight, Building2 } from 'lucide-react';

export default function AuditListItem({ audit }) {
  const navigate = useNavigate();
  const company = audit.company_name || 'Unknown Company';
  const appNumber = audit.application_id?.application_number || '—';
  const date = audit.createdAt ? new Date(audit.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div
      className="card"
      onClick={() => navigate(`/audit/${audit.application_id?._id || audit.application_id || audit._id}`, { state: { audit } })}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Building2 size={20} color="var(--primary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="card-title" style={{ marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>{appNumber} &middot; {date}</div>
        <StatusBadge status={audit.status} />
      </div>
      <ChevronRight size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
    </div>
  );
}