import mongoose from 'mongoose';

export interface IBillTopic {
  name: string;
  emoji: string;
  category: string;
  keywords: string[];
  description: string;
}

const billTopicSchema = new mongoose.Schema<IBillTopic>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  keywords: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Create indexes for faster queries
billTopicSchema.index({ name: 1 });
billTopicSchema.index({ category: 1 });
billTopicSchema.index({ keywords: 1 });

export default mongoose.models.BillTopic || mongoose.model<IBillTopic>('BillTopic', billTopicSchema); 