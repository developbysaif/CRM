import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  dueDate: { type: Date },
  amount: { type: Number, default: 0 },
});

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    projectCode: { type: String, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },

    description: { type: String, default: '' },
    projectType: { type: String, default: 'Website' },
    techStack: [{ type: String }],
    budget: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    startDate: { type: Date, default: Date.now },
    targetCompletionDate: { type: Date },
    completedAt: { type: Date },

    milestones: [MilestoneSchema],
    progress: { type: Number, min: 0, max: 100, default: 0 },

    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'In Review', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Planning',
    },
    repositoryUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ProjectSchema.pre('save', async function () {
  if (!this.projectCode) {
    const count = (await mongoose.models.Project?.countDocuments()) || 0;
    this.projectCode = `PRJ-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
