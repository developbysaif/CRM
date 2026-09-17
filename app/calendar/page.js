'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Input, Select
} from '@/components/ui/index';
import { 
  Calendar as CalendarIcon, Clock, Video, Plus, 
  ChevronLeft, ChevronRight, User, Building2 
} from 'lucide-react';

export default function CalendarPage() {
  const [view, setView] = useState('week'); // 'day' | 'week' | 'month'
  const [meetings, setMeetings] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    client: '',
    date: new Date().toISOString().slice(0, 10),
    time: '14:00',
    type: 'Discovery Call',
  });

  useEffect(() => {
    async function loadMeetings() {
      try {
        const res = await fetch('/api/meetings');
        if (res.ok) {
          const data = await res.json();
          setMeetings(data.data?.meetings || [
            { id: '1', title: 'Product Demo & Architecture Walkthrough', client: 'Grand Bistro London', time: '10:00 AM', day: 'Today', type: 'Demo' },
            { id: '2', title: 'Contract Milestone Review & Signature', client: 'Apex Luxury Real Estate', time: '02:30 PM', day: 'Today', type: 'Review' },
            { id: '3', title: 'Technical Feasibility & API Audit Call', client: 'SkyNet Solutions', time: '11:00 AM', day: 'Tomorrow', type: 'Technical' },
            { id: '4', title: 'Proposal Discussion & Pricing Negotiation', client: 'DentalCare UK', time: '04:00 PM', day: 'Thursday', type: 'Sales' },
          ]);
        }
      } catch {}
    }
    loadMeetings();
  }, []);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    setMeetings(prev => [
      {
        id: String(Date.now()),
        title: newEvent.title,
        client: newEvent.client || 'Client Lead',
        time: newEvent.time,
        day: 'Scheduled',
        type: newEvent.type,
      },
      ...prev
    ]);
    setIsAddModalOpen(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Touchpoint Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule prospect demo calls, contract signings, and automated follow-up milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {['day', 'week', 'month'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  view === v
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Week Calendar Grid */}
      <Card hover={false} className="p-0 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Current Week Schedule</span>
            <Badge variant="primary">Active Pipeline</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button type="button" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">September 2026</span>
            <button type="button" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 min-h-[480px]">
          {daysOfWeek.map((day, idx) => {
            const dayMeetings = idx === 0 ? meetings.slice(0, 2) : idx === 1 ? meetings.slice(2, 3) : [];
            return (
              <div key={day} className="p-3.5 space-y-3 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{day}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{15 + idx}th</span>
                </div>

                <div className="flex-1 space-y-2.5">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 text-xs hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {m.time}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {m.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">{m.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {m.client}
                      </p>
                    </div>
                  ))}
                  {dayMeetings.length === 0 && (
                    <div className="h-24 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-[11px]">
                      No events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Schedule Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Prospect Meeting"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Meeting Title"
            required
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="e.g. Solution Demo & Proposal Discussion"
          />
          <Input
            label="Prospect / Client Organization"
            required
            value={newEvent.client}
            onChange={(e) => setNewEvent({ ...newEvent, client: e.target.value })}
            placeholder="e.g. Grand Bistro London"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
          </div>
          <Select
            label="Meeting Category"
            options={['Discovery Call', 'Product Demo', 'Contract Review', 'Executive Briefing']}
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
