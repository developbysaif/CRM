'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Input, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import { Receipt, Plus, Download, ArrowUpRight, DollarSign } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      try {
        const res = await fetch('/api/invoices');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.data?.invoices || [
            { _id: '1', invoiceNumber: 'INV-2026-001', clientName: 'Grand Bistro London', totalAmount: 4250, status: 'Paid', dueDate: '2026-09-30' },
            { _id: '2', invoiceNumber: 'INV-2026-002', clientName: 'Apex Luxury Real Estate', totalAmount: 9000, status: 'Pending', dueDate: '2026-10-15' },
            { _id: '3', invoiceNumber: 'INV-2026-003', clientName: 'SkyNet Solutions', totalAmount: 12000, status: 'Paid', dueDate: '2026-09-25' },
          ]);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Billing & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accounts receivable, payment status, and milestone collections.
          </p>
        </div>

        <Button size="sm" variant="outline" icon={Download} onClick={() => alert('Exporting all invoices as CSV...')}>
          Export Billing Report
        </Button>
      </div>

      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Billed Client</th>
                <th className="p-4">Amount Due</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><LoadingSkeleton count={3} /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center"><EmptyState title="No invoices found" /></td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{inv.clientName}</td>
                    <td className="p-4 font-extrabold text-emerald-600">${Number(inv.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">{inv.dueDate}</td>
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
