import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: 'Technology' },
    country: { type: String, default: '' },
    address: { type: String, default: '' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    totalRevenue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
