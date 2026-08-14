import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAudits } from '../api/audits';
import AuditListItem from '../components/AuditListItem';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function ManageAudits() {
  const { user } = useContext(AuthContext);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAudits()
      .then(res => {
        const all = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const userId = String(user?.id || user?._id || '');
        const userEmail = user?.email?.toLowerCase();
        const userName = (user?.full_name || user?.username || '').toLowerCase();

        const mine = all.filter(a => {
          const inspectorIdStr = String(a.inspector_id?._id || a.inspector_id?.id || a.inspector_id || '');
          const inspectorEmail = a.inspector_id?.email?.toLowerCase();

          const matchesInspector = userId && inspectorIdStr === userId;
          const matchesInspectorEmail = userEmail && inspectorEmail && inspectorEmail === userEmail;

          const matchesAuditors = Array.isArray(a.auditors) && a.auditors.some(aud => {
            const audIdStr = String(aud?._id || aud?.id || aud || '');
            const audEmail = aud?.email?.toLowerCase();
            const audName = (aud?.name || aud?.full_name || '').toLowerCase();

            return (
              (userId && audIdStr === userId) ||
              (userEmail && audEmail && audEmail === userEmail) ||
              (userName && audName && audName === userName)
            );
          });

          return matchesInspector || matchesInspectorEmail || matchesAuditors || (!a.inspector_id && (!a.auditors || a.auditors.length === 0));
        });
        setAudits(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;
  if (audits.length === 0) return <EmptyState message="No audits found for your account." />;

  return (
    <div>
      <p className="section-heading">{audits.length} total audit{audits.length !== 1 ? 's' : ''}</p>
      {audits.map(a => <AuditListItem key={a._id} audit={a} />)}
    </div>
  );
}