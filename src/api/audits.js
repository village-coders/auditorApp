import { apiClient, API_BASE } from './client';

export const getAudits = async () => {
  try {
    const auditsPromise = apiClient('/audits').catch(() => ({ data: [] }));
    const logsheetsPromise = apiClient('/application-logsheets').catch(() => ({ data: [] }));
    const directPromise = apiClient('/application-logsheets/direct-history').catch(() => ({ data: [] }));

    const [auditsRes, lsRes, directRes] = await Promise.all([auditsPromise, logsheetsPromise, directPromise]);

    const auditList = Array.isArray(auditsRes?.data) ? auditsRes.data : (Array.isArray(auditsRes) ? auditsRes : []);
    const lsList = Array.isArray(lsRes?.data) ? lsRes.data : (Array.isArray(lsRes) ? lsRes : []);
    const directList = Array.isArray(directRes?.data) ? directRes.data : (Array.isArray(directRes) ? directRes : []);

    const allLogsheets = [...lsList, ...directList];
    const kfcLogsheets = allLogsheets.filter(l => {
      const std = String(l.certificate_standard || '').toUpperCase();
      const comp = String(l.company_name || l.client_id?.company_name || '').toUpperCase();
      const cat = String(l.product_category || '').toUpperCase();
      const auditType = String(l.audit_type || '').toUpperCase();
      const ref = String(l.logsheet_number || l.direct_ref || l.kfc_ref || '').toUpperCase();
      return (
        Boolean(l.is_kfc) ||
        l.source_type === 'kfc' ||
        l.logsheet_type === 'kfc' ||
        std.includes('KFC') ||
        comp.includes('KFC') ||
        comp.includes('KENTUCKY') ||
        cat.includes('KFC') ||
        auditType.includes('KFC') ||
        ref.includes('KFC')
      );
    });

    const mappedKfcAudits = kfcLogsheets.map(l => ({
      _id: l._id || l.id,
      id: l._id || l.id,
      is_kfc: true,
      company_name: l.company_name || l.client_id?.company_name || 'KFC',
      site_name: l.site_name || (typeof l.site_id === 'object' ? l.site_id?.name || l.site_id?.address : '') || 'KFC Production Facility',
      status: l.status || 'Waiting for Signature',
      application_id: {
        _id: l._id || l.id,
        application_number: l.logsheet_number || l.direct_ref || l.kfc_ref || 'KFC-LOGSHEET'
      },
      audit_type: l.audit_type || 'KFC Audit',
      auditors: l.auditors || 'HFA Lead Auditor',
      inspector_id: l.created_by,
      createdAt: l.created_at || l.createdAt || l.audit_date || new Date().toISOString(),
      logsheet: l
    }));

    const seenIds = new Set(auditList.map(a => String(a._id || a.id)));
    const merged = [...auditList];
    for (const kfc of mappedKfcAudits) {
      if (!seenIds.has(String(kfc._id))) {
        seenIds.add(String(kfc._id));
        merged.push(kfc);
      }
    }

    return { data: merged };
  } catch (err) {
    return apiClient('/audits');
  }
};

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
