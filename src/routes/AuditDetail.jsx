import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { completeAudit } from '../api/audits';
import { ArrowLeft, Building2, Calendar, User, CheckCircle } from 'lucide-react';

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

  const isComplete = audit.status?.includes('complete') || audit.status?.includes('done');

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

  const date = audit.createdAt
    ? new Date(audit.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const auditDate = audit.audit_date
    ? new Date(audit.audit_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';

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
            { icon: <User size={15} />, label: 'Inspector', value: audit.inspector_id?.full_name || 'You' },
            { icon: <Calendar size={15} />, label: 'Audit Date', value: auditDate },
            { icon: <Calendar size={15} />, label: 'Assigned', value: date },
          ].map(({ icon, label, value }) => (
            <div key={label} className="detail-row">
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)' }}>
                {icon} {label}
              </div>
              <div className="detail-value">{value}</div>
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