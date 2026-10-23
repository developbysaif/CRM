'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Modal, Input, Select, LoadingSkeleton
} from '@/components/ui/index';
import { 
  Calendar as CalendarIcon, Clock, Video, Plus, 
  ChevronLeft, ChevronRight, User, Building2, CheckSquare 
} from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    client: '',
    date: new Date().toISOString().slice(0, 10),
    time: '11:00',
    type: 'Follow-up Call',
  });

  const fetchCalendarTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data?.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks for calendar:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  // Compute 7 days of the active week starting from Monday
  const getWeekDates = (refDate) => {
    const day = refDate.getDay();
    // In JS 0 is Sunday, 1 is Monday.
    const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(refDate.getFullYear(), refDate.getMonth(), diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDates(currentDate);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          companyName: newEvent.client,
          dueDate: newEvent.date,
          category: newEvent.type === 'Meeting' ? 'Meeting' : 'Follow-up',
          priority: 'high',
        }),
      });
      setIsAddModalOpen(false);
      setNewEvent({
        title: '',
        client: '',
        date: new Date().toISOString().slice(0, 10),
        time: '11:00',
        type: 'Follow-up Call',
      });
      fetchCalendarTasks();
    } catch (err) {
      alert('Failed to schedule event');
    }
  };

  return (
    <AppLayout title="Touchpoint Calendar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Touchpoint Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track prospect demos, client milestones, and due execution tasks in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={goToday}
          >
            Today
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Schedule Touchpoint
          </Button>
        </div>
      </div>

      {/* Week Calendar Grid */}
      <Card hover={false} className="p-0 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Active Week View</span>
            <Badge variant="primary" className="text-[10px]">
              Live Calendar
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={prevWeek}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900 dark:text-white px-2">
              {monthYearLabel}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 min-h-[500px]">
          {weekDays.map((dateObj) => {
            const dateStr = dateObj.toISOString().slice(0, 10);
            const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(dateObj);
            const dayNum = dateObj.getDate();
            const todayActive = isToday(dateObj);

            // Filter tasks matching this day
            const dayTasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              const tDateStr = new Date(t.dueDate).toISOString().slice(0, 10);
              return tDateStr === dateStr;
            });

            return (
              <div
                key={dateStr}
                className={`p-3 space-y-3 flex flex-col transition-colors ${
                  todayActive ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-bold ${todayActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {dayName}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      todayActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  {dayTasks.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-[10px] text-slate-300 dark:text-slate-700 italic">
                      No events
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-xs shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">
                            {task.lead || 'Touchpoint'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 shrink-0">
                            {task.priority}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-[11px]">
                          {task.title}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Schedule Touchpoint Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Prospect Touchpoint"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Meeting / Touchpoint Title"
            required
            placeholder="e.g. Commercial Proposal Review"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <Input
            label="Prospect / Account Name"
            required
            placeholder="e.g. NovaCare Health"
            value={newEvent.client}
            onChange={(e) => setNewEvent({ ...newEvent, client: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              required
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <Select
              label="Touchpoint Type"
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              options={[
                { value: 'Follow-up Call', label: 'Follow-up Call' },
                { value: 'Discovery Call', label: 'Discovery Call' },
                { value: 'Demo Call', label: 'Demo Call' },
                { value: 'Contract Signing', label: 'Contract Signing' },
              ]}
            />
          </div>

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
            >
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
