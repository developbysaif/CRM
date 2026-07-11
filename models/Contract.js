import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    contractNumber: { type: String, unique: true },

    // Parties
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientCompany: { type: String, default: '' },
    clientAddress: { type: String, default: '' },
    clientPhone: { type: String, default: '' },

    companyName: { type: String, default: 'LeadAI Pro Agency' },
    companyEmail: { type: String, default: '' },
    companyAddress: { type: String, default: '' },

    // Project Details
    projectName: { type: String, required: true },
    projectDescription: { type: String, default: '' },
    projectScope: { type: String, default: '' },
    deliverables: [{ type: String }],
    startDate: { type: Date },
    endDate: { type: Date },

    // Payment Terms
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentSchedule: [
      {
        milestone: String,
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
      },
    ],

    // Legal Clauses
    ownershipClause: { type: String, default: '' },
    confidentialityClause: { type: String, default: '' },
    supportClause: { type: String, default: '' },
    maintenanceClause: { type: String, default: '' },
    terminationClause: { type: String, default: '' },
    governingLaw: { type: String, default: '' },

    // Signatures
    clientSignature: { type: String, default: '' },
    clientSignedAt: { type: Date },
    agencySignature: { type: String, default: '' },
    agencySignedAt: { type: Date },

    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Under Review', 'Signed', 'Rejected', 'Terminated'],
      default: 'Draft',
    },
    sentAt: { type: Date },
    signedAt: { type: Date },
  },
  { timestamps: true }
);

ContractSchema.pre('save', async function (next) {
  if (!this.contractNumber) {
    const count = await mongoose.models.Contract.countDocuments();
    this.contractNumber = `CON-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.Contract || mongoose.model('Contract', ContractSchema);
