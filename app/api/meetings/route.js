import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Meeting from '@/models/Meeting';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');

    let filter = {};
    if (leadId) filter.leadId = leadId;
    if (status && status !== 'all') filter.status = status;

    const meetings = await Meeting.find(filter)
      .populate('leadId', 'name email company phone')
      .populate('assignedTo', 'name email')
      .sort({ startTime: 1 });

    return apiSuccess(meetings);
  } catch (error) {
    return apiError('Failed to fetch meetings: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, title, startTime, endTime, duration = 30, type = 'Discovery Call', meetingLink, attendees, notes } = body;

    const meeting = await Meeting.create({
      leadId: leadId || null,
      title: title || 'Discovery Call with Engineering Lead',
      type,
      startTime: startTime ? new Date(startTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      duration,
      meetingLink: meetingLink || `https://meet.google.com/lead-${Math.random().toString(36).substring(2, 7)}`,
      attendees: attendees || [],
      notes: notes || '',
      status: 'Scheduled',
    });

    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, { pipelineStatus: 'Meeting Scheduled' });
      await ActivityLog.create({
        leadId,
        action: 'meeting_scheduled',
        title: `📅 Meeting Booked: ${meeting.title}`,
        description: `Scheduled for ${new Date(meeting.startTime).toLocaleString()} (${meeting.type})`,
      });
      await Notification.create({
        type: 'meeting',
        title: `📅 New Meeting Booked`,
        message: `${meeting.title} on ${new Date(meeting.startTime).toLocaleDateString()}`,
        link: `/meetings`,
      });

      // Auto-send Meeting Confirmation Email
      const lead = await Lead.findById(leadId);
      const settings = await Settings.findOne();
      if (settings?.automations?.sendMeetingReminderEmail !== false && lead?.email) {
        try {
          await sendAutomatedEmail({
            to: lead.email,
            template: 'meeting_reminder',
            variables: {
              clientName: lead.name,
              title: meeting.title,
              meetingDate: new Date(meeting.startTime).toLocaleDateString(),
              meetingTime: new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              meetingUrl: meeting.meetingLink,
            },
            leadId: lead._id,
            dedupKey: `meeting_${meeting._id}`,
          });
        } catch (mailErr) {
          console.warn('Meeting email dispatch notice:', mailErr.message);
        }
      }
    }

    return apiSuccess(meeting, 'Meeting scheduled successfully', 201);
  } catch (error) {
    console.error('Meeting booking error:', error);
    return apiError('Failed to schedule meeting: ' + error.message, 500);
  }
}
