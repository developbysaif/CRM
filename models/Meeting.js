import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['Discovery Call', 'Demo', 'Proposal Review', 'Negotiation', 'Follow-up', 'Other'], default: 'Discovery Call' },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes

    meetingLink: { type: String, default: '' },
    location: { type: String, default: '' },

    attendees: [
      {
        name: String,
        email: String,
        role: { type: String, enum: ['Client', 'Sales', 'Manager', 'Developer'], default: 'Client' },
      },
    ],

    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },

    notes: { type: String, default: '' },
    outcome: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false },
    googleEventId: { type: String, default: '' },
    calendlyLink: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);
