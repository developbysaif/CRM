'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Input, Select, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import { FileText, Plus, Download, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    clientName: '',
    totalValue: 7500,
    status: 'Draft',
  });

  useEffect(() => {
    async function loadProposals() {
      setLoading(true);
      try {
        const res = await fetch('/api/proposals');
        if (res.ok) {
          const data = await res.json();
          setProposals(data.data?.proposals || [
            { _id: '1', proposalNumber: 'PROP-0001', title: 'Complete Web Redesign & SEO Growth', clientName: 'Grand Bistro London', totalValue: 8500, status: 'Draft', createdAt: new Date().toISOString() },
            { _id: '2', proposalNumber: 'PROP-0002', title: 'Luxury Real Estate Portal Development', clientName: 'Apex Luxury Real Estate', totalValue: 18000, status: 'Sent', createdAt: new Date().toISOString() },
            { _id: '3', proposalNumber: 'PROP-0003', title: 'Enterprise Cloud Infrastructure Migration', clientName: 'SkyNet Solutions', totalValue: 24000, status: 'Accepted', createdAt: new Date().toISOString() },
          ]);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadProposals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProposal),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setProposals(prev => [
          { _id: String(Date.now()), proposalNumber: `PROP-000${prev.length + 1}`, ...newProposal, createdAt: new Date().toISOString() },
          ...prev
        ]);
      }
    } catch {
      setIsAddModalOpen(false);
    }
  };

  const statusVariants = {
    Draft: 'neutral',
    Sent: 'warning',
    Accepted: 'success',
    Rejected: 'danger',
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Commercial Proposals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate AI-assisted project scopes, deliverable breakdowns, and client pricing proposals.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Proposal
        </Button>
      </div>

      {/* Proposals Grid */}
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Proposal Number</th>
                <th className="p-4">Project Title</th>
                <th className="p-4">Client Organization</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><LoadingSkeleton count={3} /></td></tr>
              ) : proposals.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center"><EmptyState title="No proposals generated yet" /></td></tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">{p.proposalNumber || 'PROP-0001'}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{p.title}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{p.clientName}</td>
                    <td className="p-4 font-extrabold text-emerald-600">${Number(p.totalValue || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={statusVariants[p.status] || 'neutral'}>{p.status}</Badge>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Proposal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Proposal"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Proposal Title"
            required
            value={newProposal.title}
            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
            placeholder="e.g. Full-Stack Web Development & Modernization"
          />
          <Input
            label="Client Organization"
            required
            value={newProposal.clientName}
            onChange={(e) => setNewProposal({ ...newProposal, clientName: e.target.value })}
            placeholder="e.g. Zenith Global Corp"
          />
          <Input
            label="Total Estimated Value ($)"
            type="number"
            value={newProposal.totalValue}
            onChange={(e) => setNewProposal({ ...newProposal, totalValue: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Proposal</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
