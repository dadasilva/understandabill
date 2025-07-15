import mongoose from 'mongoose';

export interface ISubscriber {
  email: string;
  fcmToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new mongoose.Schema<ISubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fcmToken: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create index for faster queries
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1 });

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', subscriberSchema); 