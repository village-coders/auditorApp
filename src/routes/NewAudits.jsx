import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAudits } from '../api/audits';
import AuditListItem from '../components/AuditListItem';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function NewAudits() {
  const { user } = useContext(AuthContext);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAudits()
      .then(res => {
        const all = res.data || res;
        const myNew = all.filter(a => {
          const isMine =
            a.inspector_id?._id === user?.id ||
            a.inspector_id === user?.id ||
            a.auditors?.some(aud => aud._id === user?.id || aud.id === user?.id);
          const isNew = !['inspection_completed', 'done', 'complete'].some(s => a.status?.includes(s));
          return isMine && isNew;
        });
        setAudits(myNew);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;
  if (audits.length === 0) return <EmptyState message="No new audits assigned to you right now." />;

  return (
    <div>
      <p className="section-heading">{audits.length} audit{audits.length !== 1 ? 's' : ''} pending</p>
      {audits.map(a => <AuditListItem key={a._id} audit={a} />)}
    </div>
  );
}