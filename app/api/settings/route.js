import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return apiSuccess(settings);
  } catch (error) {
    return apiError('Failed to fetch settings: ' + error.message, 500);
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }
    return apiSuccess(settings, 'Settings saved successfully');
  } catch (error) {
    return apiError('Failed to update settings: ' + error.message, 500);
  }
}
