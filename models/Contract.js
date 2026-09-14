import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    contractNumber: { type: String, unique: true },
    version: { type: Number, default: 1 },

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
    expiryDate: { type: Date },

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
    responsibilities: { type: String, default: '' },
    revisionPolicy: { type: String, default: '' },
    ownershipClause: { type: String, default: '' },
    confidentialityClause: { type: String, default: '' },
    supportClause: { type: String, default: '' },
    maintenanceClause: { type: String, default: '' },
    terminationClause: { type: String, default: '' },
    disputeTerms: { type: String, default: '' },
    governingLaw: { type: String, default: '' },

    // Signatures
    clientSignature: { type: String, default: '' },
    clientSignedAt: { type: Date },
    agencySignature: { type: String, default: '' },
    agencySignedAt: { type: Date },

    // Approval Workflow Status
    status: {
      type: String,
      enum: ['Draft', 'Approval Required', 'Approved', 'Rejected', 'Sent', 'Under Review', 'Signed', 'Terminated'],
      default: 'Draft',
      index: true,
    },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sentAt: { type: Date },
    signedAt: { type: Date },
  },
  { timestamps: true }
);

ContractSchema.pre('save', async function () {
  if (!this.contractNumber) {
    const count = await mongoose.models.Contract.countDocuments();
    this.contractNumber = `CON-${String(count + 1).padStart(5, '0')}`;
  }
  if (!this.expiryDate) {
    this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
});

export default mongoose.models.Contract || mongoose.model('Contract', ContractSchema);
