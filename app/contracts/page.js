'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Input, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import { FileCheck, Plus, Download, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContracts() {
      setLoading(true);
      try {
        const res = await fetch('/api/contracts');
        if (res.ok) {
          const data = await res.json();
          setContracts(data.data?.contracts || [
            { _id: '1', contractNumber: 'CON-0001', title: 'Master Services Agreement (MSA)', clientName: 'Grand Bistro London', totalValue: 8500, status: 'Draft', createdAt: new Date().toISOString() },
            { _id: '2', contractNumber: 'CON-0002', title: 'Enterprise Software License & SLA', clientName: 'Apex Luxury Real Estate', totalValue: 18000, status: 'Signed', createdAt: new Date().toISOString() },
            { _id: '3', contractNumber: 'CON-0003', title: 'Cloud Infrastructure Retainer Contract', clientName: 'SkyNet Solutions', totalValue: 24000, status: 'Active', createdAt: new Date().toISOString() },
          ]);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadContracts();
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Executed Contracts & MSAs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated legal contracts generated upon moving deals to Closed Won.
          </p>
        </div>

        <Button size="sm" variant="outline" icon={Download} onClick={() => alert('Exporting all active agreements...')}>
          Export Master List
        </Button>
      </div>

      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Contract ID</th>
                <th className="p-4">Agreement Name</th>
                <th className="p-4">Signatory Client</th>
                <th className="p-4">Contract Value</th>
                <th className="p-4">Execution Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><LoadingSkeleton count={3} /></td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center"><EmptyState title="No contracts generated yet" /></td></tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-600">{c.contractNumber || 'CON-0001'}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{c.title}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{c.clientName}</td>
                    <td className="p-4 font-extrabold text-emerald-600">${Number(c.totalValue || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={c.status === 'Signed' || c.status === 'Active' ? 'success' : 'warning'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
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
    </AppLayout>
  );
}
