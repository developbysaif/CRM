'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Avatar, Modal, Input, Select
} from '@/components/ui/index';
import { 
  Users2, Plus, Mail, ShieldCheck, DollarSign, 
  Trophy, GitPullRequest, ArrowUpRight 
} from 'lucide-react';

export default function TeamPage() {
  const [members, setMembers] = useState([
    { id: '1', name: 'Saif (You)', email: 'saif@leadai.pro', role: 'Admin', leads: 42, deals: 14, revenue: '$145,000', status: 'Active' },
    { id: '2', name: 'Aura AI Sales Rep', email: 'aura.bot@leadai.pro', role: 'Agent', leads: 88, deals: 21, revenue: '$210,000', status: 'Autonomous 24/7' },
    { id: '3', name: 'Alex Morgan', email: 'alex@leadai.pro', role: 'Sales', leads: 28, deals: 8, revenue: '$84,000', status: 'Active' },
    { id: '4', name: 'Sarah Jenkins', email: 'sarah@leadai.pro', role: 'Manager', leads: 35, deals: 11, revenue: '$118,000', status: 'Active' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Sales',
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    setMembers(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        leads: 0,
        deals: 0,
        revenue: '$0',
        status: 'Invited',
      }
    ]);
    setIsAddModalOpen(false);
    setNewMember({ name: '', email: '', role: 'Sales' });
  };

  const roleColors = {
    Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Sales: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Agent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Team Management & Quotas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage sales representatives, automated AI agents, role permissions, and individual revenue attribution.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Team Member
        </Button>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {members.map((m) => (
          <Card key={m.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={m.name} size="lg" />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.name}</h3>
                  <span className="text-[11px] text-slate-400 truncate block">{m.email}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${roleColors[m.role] || roleColors.Sales}`}>
                  {m.role}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Leads Assigned</span>
                  <span className="font-bold text-slate-900 dark:text-white">{m.leads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Closed Deals</span>
                  <span className="font-bold text-slate-900 dark:text-white">{m.deals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Revenue Won</span>
                  <span className="font-extrabold text-emerald-600">{m.revenue}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {m.status}
              </span>
              <button type="button" className="text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer">
                Manage
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Invite New Sales Rep"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            placeholder="e.g. Jordan Miller"
          />
          <Input
            label="Corporate Email"
            type="email"
            required
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            placeholder="jordan@leadai.pro"
          />
          <Select
            label="Role & Permissions"
            options={['Sales', 'Manager', 'Admin', 'Agent']}
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
