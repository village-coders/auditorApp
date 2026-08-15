import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { completeAudit } from '../api/audits';
import { ArrowLeft, Building2, Calendar, User, Users, CheckCircle, Clock } from 'lucide-react';

export default function AuditDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const audit = state?.audit;

  if (!audit) {
    return (
      <div style={{ padding: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ width: 'auto', padding: '10px 18px' }}>
          Go Back
        </button>
        <p style={{ marginTop: 16, color: 'var(--text-3)' }}>Audit not found.</p>
      </div>
    );
  }

  const isComplete = audit.status?.includes('complete') || audit.status?.includes('done') || Boolean(audit.completed_at || audit.completedAt);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await completeAudit(audit._id || audit.id);
      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const rawAssigned = audit.scheduled_date || audit.finalized_date || audit.audit_date || audit.createdAt;
  const dateAssigned = rawAssigned
    ? new Date(rawAssigned).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const rawConcluded =
    audit.completed_at ||
    audit.completedAt ||
    audit.concluded_at ||
    audit.concludedAt ||
    audit.updatedAt ||
    audit.updated_at ||
    audit.application_id?.statusHistory?.find(h => (h.status || '').includes('complete') || (h.status || '').includes('done'))?.changedAt ||
    audit.createdAt ||
    audit.created_at;

  const dateConcluded = isComplete
    ? (rawConcluded ? new Date(rawConcluded).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')
    : 'In Progress';

  const getAuditorsList = () => {
    const names = [];

    if (Array.isArray(audit.auditors)) {
      audit.auditors.forEach(aud => {
        if (typeof aud === 'string') {
          const trimmed = aud.trim();
          if (trimmed && !names.includes(trimmed)) names.push(trimmed);
        } else if (aud && typeof aud === 'object') {
          const name = aud.name || aud.full_name;
          if (name && !names.includes(name)) {
            const roleStr = aud.role ? ` (${aud.role.replace(/_/g, ' ')})` : '';
            names.push(`${name}${roleStr}`);
          }
        }
      });
    } else if (typeof audit.auditors === 'string' && audit.auditors.trim()) {
      audit.auditors.split(',').forEach(n => {
        const trimmed = n.trim();
        if (trimmed && !names.includes(trimmed)) names.push(trimmed);
      });
    }

    if (names.length === 0) return 'You';
    return names.join(', ');
  };

  return (
    <>
      {/* Sub-header */}
      <div style={{ background: 'var(--primary)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}>Audit Detail</span>
      </div>

      <div className="app-content" style={{ paddingBottom: 100 }}>
        {/* Hero card */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                {audit.company_name || 'Unknown Company'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {audit.application_id?.application_number || '—'}
              </div>
            </div>
            <StatusBadge status={audit.status} />
          </div>
        </div>

        {/* Info rows */}
        <div className="card" style={{ padding: '4px 16px' }}>
          {[
            { icon: <Users size={15} />, label: 'Auditor(s)', value: getAuditorsList() },
            { icon: <Calendar size={15} />, label: 'Date Assigned', value: dateAssigned },
            { icon: <Clock size={15} />, label: 'Date Concluded', value: dateConcluded },
          ].map(({ icon, label, value }) => (
            <div key={label} className="detail-row">
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)' }}>
                {icon} {label}
              </div>
              <div className="detail-value" style={{ textAlign: 'right', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Action */}
        {!isComplete && (
          <button
            className="btn btn-primary"
            onClick={() => setShowConfirm(true)}
            style={{ marginTop: 12, borderRadius: 14, padding: '14px' }}
          >
            <CheckCircle size={18} />
            Mark as Completed
          </button>
        )}

        {isComplete && (
          <div className="card" style={{ textAlign: 'center', background: 'var(--status-done-bg)', border: '1px solid var(--primary-border)' }}>
            <CheckCircle size={22} color="var(--primary)" style={{ marginBottom: 6 }} />
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>Audit completed</p>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Complete Audit"
          message="Mark this audit as clean and complete with no non-conformances found?"
          confirmLabel="Yes, Complete"
          onConfirm={handleComplete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}