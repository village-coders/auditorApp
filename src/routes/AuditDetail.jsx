import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { completeAudit, flagNc, closeNc } from '../api/audits';
import { getFileUrl } from '../api/client';
import {
  ArrowLeft, Calendar, Users, CheckCircle, Clock,
  AlertTriangle, Plus, FileText, X, ChevronDown,
  ChevronUp, ExternalLink, MessageSquare, Paperclip,
  CheckCheck, ShieldCheck
} from 'lucide-react';
import Toast from '../components/Toast';

/* ---------- NC status helpers ---------- */
const NC_STATUS_STYLES = {
  flagged:          { label: 'Flagged (Awaiting Correction)', bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  corrected:        { label: 'Correction Submitted',          bg: '#fffbeb', color: '#d97706', dot: '#d97706' },
  client_responded: { label: 'Correction Submitted',          bg: '#fffbeb', color: '#d97706', dot: '#d97706' },
  closed:           { label: 'Closed & Resolved',             bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
};

function NcBadge({ status }) {
  const s = NC_STATUS_STYLES[status] || { label: status, bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ---------- Single NC card ---------- */
function NcCard({ nc, index, auditId, appId, onNcClosed }) {
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const [ncToast, setNcToast] = useState(null);
  const hasCorrectionDoc = nc.correction_document_url || nc.client_response_url;
  const hasResponse = nc.client_response || hasCorrectionDoc;
  const isResponded = nc.status === 'corrected' || nc.status === 'client_responded' || nc.status === 'closed';
  const isClosed = nc.status === 'closed';

  const handleClose = async (e) => {
    e.stopPropagation();
    if (closing || isClosed) return;
    setClosing(true);
    try {
      await closeNc(auditId, appId, nc._id);
      onNcClosed(nc._id);
    } catch (err) {
      setNcToast({ message: err.message || 'Failed to close NC', type: 'error' });
    } finally {
      setClosing(false);
    }
  };

  return (
    <>
      <Toast message={ncToast?.message} type={ncToast?.type} onClose={() => setNcToast(null)} />
      <div style={{ border: `1.5px solid ${isClosed ? '#bbf7d0' : (isResponded ? '#fde68a' : '#fecaca')}`, borderRadius: 14, overflow: 'hidden', background: 'var(--card-bg)' }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', cursor: 'pointer' }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 8, background: isClosed ? '#dcfce7' : (isResponded ? '#fef3c7' : '#fee2e2'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          {isClosed ? (
            <ShieldCheck size={16} color="#16a34a" />
          ) : (
            <AlertTriangle size={15} color={isResponded ? '#d97706' : '#dc2626'} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>NC #{index + 1}</span>
            <NcBadge status={nc.status} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0, lineHeight: 1.4 }}>
            {nc.text || 'Non-Conformity Report'}
          </p>
        </div>
        <div style={{ flexShrink: 0, marginLeft: 4 }}>
          {open ? <ChevronUp size={16} color="var(--text-3)" /> : <ChevronDown size={16} color="var(--text-3)" />}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* NC document */}
          {(nc.document_url || nc.url) && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px 0' }}>NC Document</p>
              <a
                href={getFileUrl(nc.document_url || nc.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0284c7', fontWeight: 600, textDecoration: 'none', background: '#f0f9ff', padding: '6px 12px', borderRadius: 8 }}
              >
                <FileText size={13} /> View NC Document <ExternalLink size={11} />
              </a>
            </div>
          )}

          {/* Date flagged */}
          {nc.flagged_at && (
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Flagged: {new Date(nc.flagged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}

          {/* Client response section */}
          {isResponded && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}>
                Client Correction Details
              </p>
              {nc.client_response && (
                <p style={{ fontSize: 13, color: '#166534', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                  {nc.client_response}
                </p>
              )}
              {hasCorrectionDoc && (
                <a
                  href={getFileUrl(nc.correction_document_url || nc.client_response_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#15803d', fontWeight: 600, textDecoration: 'none', background: '#dcfce7', padding: '6px 12px', borderRadius: 8 }}
                >
                  <Paperclip size={13} /> View Correction Document <ExternalLink size={11} />
                </a>
              )}
              {nc.corrected_at && (
                <p style={{ fontSize: 11, color: '#16a34a', margin: '8px 0 0 0' }}>
                  Submitted on: {new Date(nc.corrected_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {!isResponded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
              <MessageSquare size={13} color="#d97706" />
              <span style={{ fontSize: 12, color: '#92400e' }}>Awaiting client correction document/reply</span>
            </div>
          )}

          {/* Action button to Close NC */}
          {!isClosed && (
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={closing}
                style={{
                  width: '100%',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: closing ? 'not-allowed' : 'pointer',
                  opacity: closing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <CheckCheck size={16} />
                {closing ? 'Closing NC...' : 'Mark NC as Closed'}
              </button>
            </div>
          )}

          {isClosed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#dcfce7', borderRadius: 8, color: '#15803d', fontSize: 12, fontWeight: 600 }}>
              <ShieldCheck size={14} color="#16a34a" /> NC marked as Closed & Resolved
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

/* ---------- Main Component ---------- */
export default function AuditDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [audit, setAudit] = useState(state?.audit);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // NC flag form state
  const [showNcForm, setShowNcForm] = useState(false);
  const [ncText, setNcText] = useState('');
  const [ncFile, setNcFile] = useState(null);
  const [flagging, setFlagging] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });

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

  const ncReports = Array.isArray(audit.nc_reports) ? audit.nc_reports : [];
  const isComplete = audit.status?.includes('complete') || audit.status?.includes('done') || Boolean(audit.completed_at || audit.completedAt);
  const appId = audit.application_id?._id || audit.application_id;

  /* Mark as Audited */
  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await completeAudit(audit._id || audit.id);
      setAudit(a => ({ ...a, status: 'audit_completed', completed_at: new Date().toISOString() }));
      setShowConfirm(false);
    } catch (err) {
      showToast(err.message || 'Failed to complete audit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* Flag NC */
  const handleFlagNc = async (e) => {
    e.preventDefault();
    if (!ncText.trim()) { setFlagError('Please describe the non-conformity.'); return; }
    setFlagging(true);
    setFlagError('');
    try {
      const res = await flagNc(audit._id || audit.id, appId, ncText.trim(), ncFile || undefined);
      const updatedNcReports = res.data?.nc_reports || [...ncReports, {
        text: ncText.trim(),
        status: 'flagged',
        flagged_at: new Date().toISOString(),
        document_url: null
      }];
      setAudit(a => ({ ...a, nc_reports: updatedNcReports, status: 'nc_flagged' }));
      setNcText('');
      setNcFile(null);
      setShowNcForm(false);
    } catch (err) {
      setFlagError(err.message || 'Failed to flag NC');
    } finally {
      setFlagging(false);
    }
  };

  /* Callback when an NC is marked as closed */
  const handleNcClosed = (reportId) => {
    setAudit(a => {
      const updated = (a.nc_reports || []).map(r => {
        if (!reportId || String(r._id) === String(reportId)) {
          return { ...r, status: 'closed' };
        }
        return r;
      });
      const allClosed = updated.every(r => r.status === 'closed');
      return {
        ...a,
        nc_reports: updated,
        status: allClosed ? (isComplete ? 'audit_completed' : 'nc_closed') : a.status
      };
    });
  };

  /* Date helpers */
  const rawAssigned = audit.scheduled_date || audit.finalized_date || audit.audit_date || audit.createdAt;
  const dateAssigned = rawAssigned
    ? new Date(rawAssigned).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const rawConcluded = audit.completed_at || audit.completedAt || audit.concluded_at || audit.updatedAt || audit.createdAt;
  const dateConcluded = isComplete
    ? (rawConcluded ? new Date(rawConcluded).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')
    : 'In Progress';

  const getAuditorsList = () => {
    const names = [];
    if (Array.isArray(audit.auditors)) {
      audit.auditors.forEach(aud => {
        if (typeof aud === 'string') { const t = aud.trim(); if (t && !names.includes(t)) names.push(t); }
        else if (aud && typeof aud === 'object') {
          const name = aud.name || aud.full_name;
          if (name && !names.includes(name)) {
            names.push(`${name}${aud.role ? ` (${aud.role.replace(/_/g, ' ')})` : ''}`);
          }
        }
      });
    }
    return names.length ? names.join(', ') : 'You';
  };

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="app-content" style={{ paddingBottom: 100 }}>

        {/* Back + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'var(--primary-subtle)', border: 'none', color: 'var(--primary)', cursor: 'pointer', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Audit Detail</span>
        </div>

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
        <div className="card" style={{ padding: '4px 16px', marginBottom: 12 }}>
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

        {/* Mark as Audited / Completed - Comes First */}
        <div style={{ marginBottom: 16 }}>
          {!isComplete ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowConfirm(true)}
              style={{
                borderRadius: 14,
                padding: '14px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 15,
                fontWeight: 700
              }}
            >
              <CheckCircle size={18} />
              Mark as Audited
            </button>
          ) : (
            <div className="card" style={{ textAlign: 'center', background: 'var(--status-done-bg)', border: '1px solid var(--primary-border)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle size={18} color="var(--primary)" />
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>Audit Completed / Audited</span>
              </div>
            </div>
          )}
        </div>

        {/* NC Reports Section */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="section-heading" style={{ margin: 0 }}>
              Non-Conformity Reports ({ncReports.length})
            </p>
            <button
              onClick={() => { setShowNcForm(v => !v); setFlagError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: showNcForm ? '#fef2f2' : 'var(--primary-subtle)', color: showNcForm ? '#dc2626' : 'var(--primary)', border: `1px solid ${showNcForm ? '#fecaca' : 'var(--primary-border)'}`, borderRadius: 10, padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {showNcForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Flag NC</>}
            </button>
          </div>

          {/* Flag NC form */}
          {showNcForm && (
            <div className="card" style={{ marginBottom: 12, border: '1.5px solid #fecaca', background: '#fff5f5' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> New Non-Conformity Report
              </p>
              <form onSubmit={handleFlagNc} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
                    Describe the Non-Conformity *
                  </label>
                  <textarea
                    value={ncText}
                    onChange={e => setNcText(e.target.value)}
                    placeholder="Describe the issue found during inspection..."
                    rows={3}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', padding: '10px 12px', fontSize: 13, color: 'var(--text-1)', background: 'var(--card-bg)', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
                    Attach Document (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => setNcFile(e.target.files?.[0] || null)}
                    style={{ fontSize: 12, color: 'var(--text-2)', width: '100%' }}
                  />
                  {ncFile && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Selected: {ncFile.name}</p>}
                </div>
                {flagError && (
                  <p style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 8, margin: 0 }}>
                    {flagError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={flagging}
                  style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: flagging ? 'not-allowed' : 'pointer', opacity: flagging ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <AlertTriangle size={15} />
                  {flagging ? 'Flagging NC...' : 'Flag Non-Conformity'}
                </button>
              </form>
            </div>
          )}

          {/* NC list */}
          {ncReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ncReports.map((nc, i) => (
                <NcCard
                  key={nc._id || i}
                  nc={nc}
                  index={i}
                  auditId={audit._id || audit.id}
                  appId={appId}
                  onNcClosed={handleNcClosed}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <CheckCircle size={22} color="var(--primary)" style={{ marginBottom: 6 }} />
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>No non-conformities flagged</p>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Mark as Audited"
          message="Mark this audit as audited and conclude the physical audit inspection?"
          confirmLabel={submitting ? 'Please wait…' : 'Yes, Mark as Audited'}
          onConfirm={handleComplete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}