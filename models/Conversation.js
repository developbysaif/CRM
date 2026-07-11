import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    sessionId: { type: String, required: true, unique: true },
    messages: [MessageSchema],
    collectedData: {
      name: String,
      email: String,
      phone: String,
      company: String,
      country: String,
      businessType: String,
      projectType: String,
      targetAudience: String,
      businessGoals: String,
      currentWebsite: String,
      preferredTechnology: [String],
      budget: String,
      deadline: String,
      expectedFeatures: [String],
      paymentGateway: Boolean,
      adminDashboard: Boolean,
      authentication: Boolean,
      cms: Boolean,
      booking: Boolean,
      inventory: Boolean,
      reports: Boolean,
      analytics: Boolean,
      aiFeatures: Boolean,
    },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    currentStep: { type: String, default: 'greeting' },
    isConverted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
