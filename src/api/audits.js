import { apiClient } from './client';

export const getAudits = () => apiClient('/audits');
export const getAuditByAppId = (appId) => apiClient(`/audits/application/${appId}`);
export const completeAudit = (id) => apiClient(`/audits/complete-clean`, {
  method: 'POST',
  body: JSON.stringify({ audit_id: id })
});