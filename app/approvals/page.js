'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import {
  ShieldAlert, Check, X, Mail, FileText, 
  Sparkles, Building2, User, ArrowUpRight 
} from 'lucide-react';

export default function ApprovalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/approvals?status=approval_required');
      if (res.ok) {
        const data = await res.json();
        setItems(data.data?.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleDecision = async (id, decision) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: id, action: decision }),
      });
      fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Human Approval Center
            </h1>
            <Badge variant="warning">Zero Auto-Send Gating</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every autonomous AI cold outreach draft, proposal, or MSA requires explicit human sign-off before dispatch.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchApprovals}>
          Refresh Queue
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : items.length === 0 ? (
        <Card hover={false} className="py-16 text-center">
          <EmptyState
            icon={ShieldAlert}
            title="Approval Queue Clear"
            description="No pending cold emails, proposals, or contracts awaiting authorization."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.type === 'cold_email' ? 'Outbound Cold Email' : 'Contract / Proposal Draft'}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Recipient: {item.recipientEmail || 'prospect@business.com'}</span>
                      <span>• Lead: {item.leadId?.companyName || item.leadId?.name || 'Prospect'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={X}
                    loading={actionLoading[item._id]}
                    onClick={() => handleDecision(item._id, 'reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    icon={Check}
                    loading={actionLoading[item._id]}
                    onClick={() => handleDecision(item._id, 'approve')}
                  >
                    Approve & Send
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject: {item.payload?.subject || 'Enterprise Web Modernization Opportunity'}
                </span>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                  {item.payload?.body || item.payload?.content || 'Preview of AI generated message payload...'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
