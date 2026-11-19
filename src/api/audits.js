import { apiClient, API_BASE } from './client';

export const getAudits = () => apiClient('/audits');
export const getAuditByAppId = (appId) => apiClient(`/audits/application/${appId}`);
export const completeAudit = (id) => apiClient(`/audits/complete-clean`, {
  method: 'POST',
  body: JSON.stringify({ audit_id: id })
});

export const flagNc = async (auditId, applicationId, text, file) => {
  const token = localStorage.getItem('token');
  const form = new FormData();
  if (auditId) form.append('audit_id', auditId);
  if (applicationId) form.append('application_id', applicationId);
  form.append('text', text);
  if (file) form.append('nc_document', file);
  const res = await fetch(`${API_BASE}/audits/flag-nc`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to flag NC');
  return data;
};

export const closeNc = (auditId, applicationId, reportId, note) => apiClient('/audits/nc-close', {
  method: 'POST',
  body: JSON.stringify({ audit_id: auditId, application_id: applicationId, report_id: reportId, note })
});