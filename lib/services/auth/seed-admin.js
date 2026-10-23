import connectDB from '@/lib/db';
import User from '@/models/User';

let isSeeding = false;

/**
 * Ensures at least one admin exists in the database.
 * Seeds from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
 * if no admin account is found.
 */
export async function ensureAdminSeeded() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    await connectDB();
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const email = (process.env.ADMIN_EMAIL || 'admin@leadai.pro').toLowerCase().trim();
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        existingUser.role = 'admin';
        existingUser.isActive = true;
        await existingUser.save();
        console.log(`[SeedAdmin] Upgraded existing user (${email}) to admin role.`);
      } else {
        const password = process.env.ADMIN_PASSWORD || 'Admin123!';
        const name = process.env.ADMIN_NAME || 'Admin User';
        await User.create({
          name,
          email,
          password,
          role: 'admin',
          isActive: true,
          monthlyQuota: 75000,
        });
        console.log(`[SeedAdmin] Auto-seeded default admin account (${email}).`);
      }
    }
  } catch (error) {
    console.error('[SeedAdmin] Failed to seed default admin:', error);
  } finally {
    isSeeding = false;
  }
}
