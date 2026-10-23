'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Avatar, Modal, Input, Select, LoadingSkeleton, EmptyState
} from '@/components/ui/index';
import { 
  Users2, Plus, Mail, ShieldCheck, DollarSign, 
  Trophy, GitPullRequest, ArrowUpRight, Target
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency } from '@/lib/constants';

const ROLE_BADGES = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  sales: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  agent: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'sales',
    monthlyQuota: 50000,
  });

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data?.members || []);
        setSummary(data.data?.summary || null);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || 'Failed to add member');
        return;
      }
      setCreatedCredentials(data.data);
      fetchTeam();
    } catch (err) {
      alert('Network error adding team member');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <AppLayout title="Team & Quotas">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Team Quotas & Sales Reps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real quota attainment, assigned opportunity counts, and verified closed revenue per rep.
          </p>
        </div>

        {isAdminOrManager && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => {
              setCreatedCredentials(null);
              setIsAddModalOpen(true);
            }}
          >
            Add Team Member
          </Button>
        )}
      </div>

      {/* Team KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Reps</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {loading ? '...' : (summary?.memberCount || members.length)}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Closed Deals</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">
            {loading ? '...' : (summary?.totalWonDeals || 0)}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Team Closed Revenue</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {loading ? '...' : formatCurrency(summary?.totalRevenue || 0)}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quota Attainment</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">
            {loading ? '...' : `${summary?.overallAttainment || 0}%`}
          </span>
        </div>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users2 className="w-4 h-4 text-blue-600" />
            Sales Rep Performance &amp; Quotas
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Live DB Telemetry
          </Badge>
        </CardHeader>

        <CardContent>
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : members.length === 0 ? (
            <EmptyState
              title="No Team Members Found"
              description="Invite reps or managers to start delegating leads and tracking quotas."
              actionLabel="Add Member"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Representative</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-right">Assigned Leads</th>
                    <th className="pb-3 text-right">Won Deals</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">Monthly Quota</th>
                    <th className="pb-3 text-right">Attainment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {members.map((member) => {
                    const isYou = currentUser?.email && member.email.toLowerCase() === currentUser.email.toLowerCase();
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {isYou && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ROLE_BADGES[member.role] || ROLE_BADGES.sales}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-300 font-semibold">{member.leads}</td>
                        <td className="py-3 text-right text-blue-600 dark:text-blue-400 font-bold">{member.deals}</td>
                        <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(member.revenue)}
                        </td>
                        <td className="py-3 text-right text-slate-500 font-semibold">
                          {formatCurrency(member.monthlyQuota)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  member.attainment >= 100
                                    ? 'bg-emerald-500'
                                    : member.attainment >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(member.attainment, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-[11px] w-9 text-right">
                              {member.attainment}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
      >
        {createdCredentials ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                Member Created Successfully!
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Share these initial credentials with the team member:
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono space-y-1">
                <div>Email: <strong className="text-slate-900 dark:text-white">{createdCredentials.user?.email}</strong></div>
                <div>Temporary Password: <strong className="text-blue-600 dark:text-blue-400">{createdCredentials.temporaryPassword}</strong></div>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setIsAddModalOpen(false);
                setCreatedCredentials(null);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAddMember} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Rachel Adams"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="rachel@company.com"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <Select
              label="Role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              options={[
                { value: 'sales', label: 'Sales Representative' },
                { value: 'manager', label: 'Sales Manager' },
                { value: 'admin', label: 'System Admin' },
                { value: 'agent', label: 'AI Agent / Automation' },
              ]}
            />
            <Input
              label="Monthly Quota (£)"
              type="number"
              placeholder="50000"
              value={newMember.monthlyQuota}
              onChange={(e) => setNewMember({ ...newMember, monthlyQuota: Number(e.target.value) })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={submitting}
              >
                Create Member
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
}
