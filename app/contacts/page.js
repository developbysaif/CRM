'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, Input, Select, Modal, Drawer, 
  Badge, Avatar, Pagination, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import { 
  Search, Plus, Download, Mail, Phone, Building2, 
  User, ArrowUpRight, MoreHorizontal, Filter 
} from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    jobTitle: 'Decision Maker',
  });

  useEffect(() => {
    async function loadContacts() {
      setLoading(true);
      try {
        const res = await fetch('/api/leads?limit=50');
        if (res.ok) {
          const data = await res.json();
          setContacts(data.data?.leads || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, []);

  const handleRowClick = (contact) => {
    setSelectedContact(contact);
    setIsDrawerOpen(true);
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContact.name,
          company: newContact.company,
          email: newContact.email,
          phone: newContact.phone,
          status: 'New Lead',
          leadScore: 70,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewContact({ name: '', company: '', email: '', phone: '', jobTitle: 'Decision Maker' });
        // Reload contacts
        const reload = await fetch('/api/leads?limit=50');
        const data = await reload.json();
        setContacts(data.data?.leads || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.companyName || c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Contacts Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage individual stakeholder relationships, decision makers, and past touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={Download}
            onClick={() => alert('Exporting contacts to CSV...')}
          >
            Export
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6" hover={false}>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name, email, or company..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Contacts Table */}
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Contact</th>
                <th className="p-4">Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Owner</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <LoadingSkeleton count={5} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <EmptyState title="No contacts found" description="Create a contact to start managing your network." />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => handleRowClick(c)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name || 'User'} />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name || 'Unnamed'}</span>
                          <span className="text-[11px] text-slate-400">{c.jobTitle || 'Executive Lead'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {c.companyName || c.company || 'Enterprise'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{c.email || 'N/A'}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{c.phone || 'N/A'}</td>
                    <td className="p-4">
                      <Badge variant="primary">{c.status || 'Active'}</Badge>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Saif (Admin)</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRowClick(c); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      >
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

      {/* Slide-over Contact Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Contact Profile"
      >
        {selectedContact && (
          <div className="space-y-6 text-xs">
            <div className="text-center py-4 border-b border-slate-100 dark:border-slate-800">
              <Avatar name={selectedContact.name || 'U'} size="lg" className="mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedContact.name}</h3>
              <p className="text-slate-500">{selectedContact.companyName || selectedContact.company}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Email Address</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedContact.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedContact.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Pipeline Status</span>
                <span className="font-bold text-blue-600">{selectedContact.status || 'New Lead'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <Link href={`/leads/${selectedContact._id}`}>
                <Button size="sm" variant="primary" iconRight={ArrowUpRight}>
                  View Full 360° Profile
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setIsDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Contact"
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            placeholder="e.g. Jordan Miller"
          />
          <Input
            label="Company"
            required
            value={newContact.company}
            onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
            placeholder="e.g. Stripe Solutions"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Work Email"
              type="email"
              required
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="jordan@stripe.com"
            />
            <Input
              label="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              placeholder="+1 555-0199"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
