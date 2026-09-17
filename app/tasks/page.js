'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, Input, Select, Modal, Badge, PriorityBadge, Tabs, EmptyState
} from '@/components/ui/index';
import {
  CheckSquare, Square, Plus, Calendar, Clock, 
  User, Building2, AlertCircle, ArrowUpRight, Check 
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Schedule follow-up demo on customized pipeline analytics', lead: 'Grand Bistro London', priority: 'High', due: 'Today', category: 'today', completed: false, assignedTo: 'Saif' },
    { id: '2', title: 'Send revised Master Services Agreement & payment milestone', lead: 'Apex Luxury Real Estate', priority: 'Urgent', due: 'Today', category: 'today', completed: false, assignedTo: 'Saif' },
    { id: '3', title: 'Review inbound email reply and confirm meeting availability', lead: 'SkyNet Solutions', priority: 'Medium', due: 'Tomorrow', category: 'upcoming', completed: false, assignedTo: 'Alex' },
    { id: '4', title: 'Run Apify discovery scan on dental clinics in Manchester', lead: 'DentalCare UK', priority: 'Low', due: 'In 3 days', category: 'upcoming', completed: false, assignedTo: 'Aura AI' },
    { id: '5', title: 'Verify digital footprint score for uncontacted restaurant batch', lead: 'Crown Tavern London', priority: 'High', due: 'Yesterday', category: 'overdue', completed: false, assignedTo: 'Saif' },
    { id: '6', title: 'Generated AI personalized cold outreach pitch', lead: 'NovaCare Health', priority: 'Medium', due: '2 days ago', category: 'completed', completed: true, assignedTo: 'Saif' },
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    lead: '',
    priority: 'High',
    due: 'Today',
    category: 'today',
  });

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const next = !t.completed;
        return { ...t, completed: next, category: next ? 'completed' : 'today' };
      }
      return t;
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks(prev => [
      {
        id: String(Date.now()),
        title: newTask.title,
        lead: newTask.lead || 'General Account',
        priority: newTask.priority,
        due: newTask.due,
        category: newTask.category,
        completed: false,
        assignedTo: 'Saif',
      },
      ...prev
    ]);
    setIsAddModalOpen(false);
    setNewTask({ title: '', lead: '', priority: 'High', due: 'Today', category: 'today' });
  };

  const tabs = [
    { id: 'all', label: 'All Tasks', badge: tasks.length },
    { id: 'today', label: 'Due Today', badge: tasks.filter(t => t.category === 'today').length },
    { id: 'upcoming', label: 'Upcoming', badge: tasks.filter(t => t.category === 'upcoming').length },
    { id: 'overdue', label: 'Overdue', badge: tasks.filter(t => t.category === 'overdue').length },
    { id: 'completed', label: 'Completed', badge: tasks.filter(t => t.completed).length },
  ];

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return t.completed;
    return t.category === activeTab && !t.completed;
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Task Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize sales action items, lead touchpoints, and scheduled cadence milestones.
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

      {/* Task Tabs */}
      <Card hover={false} className="p-0 overflow-hidden mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-5 pt-3" />

        <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <EmptyState title="No tasks in this view" description="You are all caught up!" />
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer px-2 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTask(t.id); }}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      t.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500'
                    }`}
                  >
                    {t.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <span className={`text-xs font-bold block truncate ${
                      t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                        <Building2 className="w-3 h-3" /> {t.lead}
                      </span>
                      <span>• Assigned to {t.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    t.category === 'overdue' ? 'text-red-600 font-bold' : 'text-slate-500'
                  }`}>
                    <Calendar className="w-3 h-3" /> {t.due}
                  </span>
                  <PriorityBadge priority={t.priority} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Action Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Description"
            required
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="e.g. Call CEO to finalize pilot contract terms"
          />
          <Input
            label="Related Prospect / Account"
            value={newTask.lead}
            onChange={(e) => setNewTask({ ...newTask, lead: e.target.value })}
            placeholder="e.g. Apex Luxury Real Estate"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              options={['Urgent', 'High', 'Medium', 'Low']}
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            />
            <Select
              label="Schedule Bucket"
              options={[
                { value: 'today', label: 'Due Today' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'overdue', label: 'Overdue' },
              ]}
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
