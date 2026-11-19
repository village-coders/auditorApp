import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ChevronRight, Building2 } from 'lucide-react';

export default function AuditListItem({ audit }) {
  const navigate = useNavigate();
  const isKfc = Boolean(audit.is_kfc) || (audit.company_name || '').toUpperCase().includes('KFC');
  const company = audit.company_name || 'Unknown Company';
  const appNumber = audit.application_id?.application_number || audit.logsheet?.logsheet_number || audit.logsheet?.direct_ref || '—';
  const date = audit.createdAt ? new Date(audit.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div
      className="card"
      onClick={() => navigate(`/audit/${audit.application_id?._id || audit.application_id || audit._id}`, { state: { audit } })}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        border: isKfc ? '1.5px solid #fca5a5' : '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        background: isKfc ? '#fef2f2' : 'var(--primary-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isKfc ? <span style={{ fontSize: 20 }}>🍗</span> : <Building2 size={20} color="var(--primary)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '3px' }}>
          <div className="card-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</div>
          {isKfc && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>
              🍗 KFC
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>{appNumber} &middot; {date}</div>
        <StatusBadge status={audit.status} />
      </div>
      <ChevronRight size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
    </div>
  );
}
