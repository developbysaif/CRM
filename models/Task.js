import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: true,
    },
    type: {
      type: String,
      enum: ['Follow-up', 'Call', 'Email', 'Proposal', 'Audit', 'General'],
      default: 'General',
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ organizationId: 1, status: 1, dueDate: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
