'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button,
  Badge,
  PriorityBadge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  Spinner,
  EmptyState,
  Modal,
} from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Users,
  Sparkles,
  Phone,
  Mail,
  FileText,
  SearchCode,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, today: 0, overdue: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | today | upcoming | overdue | completed
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [leadsList, setLeadsList] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    leadId: '',
    priority: 'Medium',
    type: 'Follow-up',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('filter', activeTab);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data.tasks || []);
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [activeTab, priorityFilter, searchQuery]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads?limit=50');
      const data = await res.json();
      if (data.success) {
        setLeadsList(data.data.leads || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task._id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(nextStatus === 'completed' ? 'Task marked complete!' : 'Task reopened');
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to update task');
        fetchTasks();
      }
    } catch {
      toast.error('Network error updating task');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Task removed');
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to delete task');
      }
    } catch {
      toast.error('Network error deleting task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    setSavingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('New task scheduled!');
        setIsModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          leadId: '',
          priority: 'Medium',
          type: 'Follow-up',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to create task');
      }
    } catch {
      toast.error('Network error creating task');
    } finally {
      setSavingTask(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-3.5 h-3.5 text-blue-500" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Proposal':
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Audit':
        return <SearchCode className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const due = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-red-600 font-bold inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Overdue by {Math.abs(diffDays)}d
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="text-amber-600 font-bold inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Today
        </span>
      );
    } else if (diffDays === 1) {
      return <span className="text-blue-600 font-medium">Due Tomorrow</span>;
    } else {
      return <span className="text-slate-500">In {diffDays} days</span>;
    }
  };

  return (
    <AppLayout
      title="Sales Tasks & Action Items"
      subtitle="Prioritize critical prospect touchpoints, scheduled calls, and closing tasks"
    >
      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<CheckSquare className="w-5 h-5 text-blue-600" />}
          label="Open Tasks"
          value={stats.open || 0}
          change="Pending action items"
          trend="neutral"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          label="Due Today"
          value={stats.today || 0}
          change="High priority for today"
          trend={stats.today > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          label="Overdue Tasks"
          value={stats.overdue || 0}
          change="Require immediate touchpoint"
          trend={stats.overdue > 0 ? 'down' : 'up'}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          label="Completed"
          value={stats.completed || 0}
          change="Deliverables finished"
          trend="up"
        />
      </div>

      {/* Control Bar: Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Tasks', count: stats.total },
            { id: 'today', label: 'Due Today', count: stats.today },
            { id: 'upcoming', label: 'Upcoming', count: Math.max(0, stats.open - stats.today - stats.overdue) },
            { id: 'overdue', label: 'Overdue', count: stats.overdue },
            { id: 'completed', label: 'Completed', count: stats.completed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count || 0}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Task
        </Button>
      </div>

      {/* Search and Secondary Filters */}
      <Card className="p-3.5 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by title, company, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Priority:</span>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tasks Content List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-16">
            <Spinner size={36} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No tasks match your filter"
              description="Keep your pipeline moving by creating follow-up actions and reminders for your prospects."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create First Task
                </Button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task._id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors ${
                    isCompleted ? 'bg-slate-50/40 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-0.5 shrink-0 transition-colors rounded-lg ${
                        isCompleted
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-slate-300 hover:text-blue-600'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold transition-all ${
                            isCompleted
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {getTypeIcon(task.type)}
                          {task.type || 'Follow-up'}
                        </span>

                        <PriorityBadge priority={task.priority} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                          {task.description}
                        </p>
                      )}

                      {/* Lead association pill */}
                      {task.leadId && (
                        <div className="pt-0.5 flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400">Prospect:</span>
                          <Link
                            href={`/leads/${task.leadId._id || task.leadId}`}
                            className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Users className="w-3 h-3 text-slate-400" />
                            {task.leadId.companyName || task.leadId.company || task.leadId.name || 'Lead Details'}
                            <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-8 sm:pl-0">
                    <div className="text-right text-xs">
                      <div>{formatDueDate(task.dueDate)}</div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal: Create Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Sales Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule discovery call, follow up on contract..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Activity Type
              </label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Follow-up">Follow-up</option>
                <option value="Call">Phone Call / Meeting</option>
                <option value="Email">Outreach Email</option>
                <option value="Proposal">Proposal Review</option>
                <option value="Audit">Website Audit</option>
                <option value="General">General Deliverable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                required
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Related Lead / Prospect
              </label>
              <select
                value={newTask.leadId}
                onChange={(e) => setNewTask({ ...newTask, leadId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Unassigned (Internal) --</option>
                {leadsList.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.companyName || l.company || l.name} ({l.pipelineStatus || 'Lead'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Notes & Context
            </label>
            <textarea
              rows={3}
              placeholder="Add key context, prospect objectives, or discussion items..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingTask}
              icon={<Plus className="w-4 h-4" />}
            >
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
