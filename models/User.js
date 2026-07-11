import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'sales', 'manager'], default: 'sales' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
