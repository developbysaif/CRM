'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardContent, Input, Select, Modal, Badge, PriorityBadge, Tabs, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import {
  CheckSquare, Square, Plus, Calendar, Clock, 
  User, Building2, AlertCircle, ArrowUpRight, Check 
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [leadsList, setLeadsList] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    leadId: '',
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data?.tasks || []);
        setCounts(data.data?.counts || { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Load leads for selector
  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch('/api/leads?limit=50');
        if (res.ok) {
          const data = await res.json();
          setLeadsList(data.data?.leads || []);
        }
      } catch {}
    }
    loadLeads();
  }, []);

  const toggleTask = async (id, currentCompleted) => {
    const nextCompleted = !currentCompleted;
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: nextCompleted } : t)));

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: nextCompleted }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchTasks();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setSubmitting(true);

    try {
      const selectedLead = leadsList.find(l => l._id === newTask.leadId);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          leadId: newTask.leadId || null,
          leadName: selectedLead?.companyName || selectedLead?.name || '',
          priority: newTask.priority.toLowerCase(),
          dueDate: newTask.dueDate,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewTask({
          title: '',
          leadId: '',
          priority: 'High',
          dueDate: new Date().toISOString().split('T')[0],
        });
        fetchTasks();
      }
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'today') return !t.completed && t.category === 'today';
    if (activeTab === 'upcoming') return !t.completed && t.category === 'upcoming';
    if (activeTab === 'overdue') return !t.completed && t.category === 'overdue';
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  return (
    <AppLayout title="Tasks & Follow-ups">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Follow-up & Execution Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic pipeline task tracking linked to verified lead accounts and reps.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Task
        </Button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: `All Tasks (${counts.all})` },
          { id: 'today', label: `Due Today (${counts.today})` },
          { id: 'upcoming', label: `Upcoming (${counts.upcoming})` },
          { id: 'overdue', label: `Overdue (${counts.overdue})` },
          { id: 'completed', label: `Completed (${counts.completed})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton count={4} />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No Tasks Found"
                description={
                  activeTab === 'all'
                    ? "You don't have any follow-up tasks scheduled yet."
                    : `No tasks matching the "${activeTab}" filter.`
                }
                actionLabel="Create First Task"
                onAction={() => setIsAddModalOpen(true)}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                    task.completed ? 'opacity-60 bg-slate-50/30 dark:bg-slate-900/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      aria-label={task.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950/60" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className={`text-xs font-bold text-slate-900 dark:text-white ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {task.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {task.leadId ? (
                            <Link href={`/leads/${task.leadId}`} className="hover:text-blue-600 no-underline">
                              {task.lead}
                            </Link>
                          ) : (
                            <span>{task.lead}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.assignedTo || currentUser?.name || 'Admin'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        task.category === 'overdue' && !task.completed
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : task.category === 'today' && !task.completed
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.dueLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Follow-up Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Description"
            required
            placeholder="e.g. Schedule commercial follow-up call"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />

          <Select
            label="Linked Account / Lead"
            value={newTask.leadId}
            onChange={(e) => setNewTask({ ...newTask, leadId: e.target.value })}
            options={[
              { value: '', label: 'General Task (No Lead Linked)' },
              ...leadsList.map((l) => ({
                value: l._id,
                label: `${l.companyName || l.company || l.name} (${l.status || 'New'})`,
              })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              options={[
                { value: 'Low', label: 'Low Priority' },
                { value: 'Medium', label: 'Medium Priority' },
                { value: 'High', label: 'High Priority' },
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              required
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
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
              loading={submitting}
            >
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
