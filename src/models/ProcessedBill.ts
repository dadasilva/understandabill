import mongoose from 'mongoose';

export interface IProcessedBill {
  billId: string;
  congress: number;
  billType: string;
  billNumber: string;
  title: string;
  summary: string;
  enactedDate: Date;
  processedAt: Date;
  topic?: string;
  emoji?: string;
  upvotes?: number;
  downvotes?: number;
}

const processedBillSchema = new mongoose.Schema<IProcessedBill>({
  billId: {
    type: String,
    required: true,
    unique: true,
  },
  congress: {
    type: Number,
    required: true,
  },
  billType: {
    type: String,
    required: true,
  },
  billNumber: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  enactedDate: {
    type: Date,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  topic: {
    type: String,
    required: false,
  },
  emoji: {
    type: String,
    required: false,
  },
  upvotes: {
    type: Number,
    default: 0,
    required: false,
  },
  downvotes: {
    type: Number,
    default: 0,
    required: false,
  },
}, {
  timestamps: true,
});

// Create indexes for faster queries
processedBillSchema.index({ billId: 1 });
processedBillSchema.index({ enactedDate: -1 });
processedBillSchema.index({ processedAt: -1 });
processedBillSchema.index({ topic: 1 });
processedBillSchema.index({ emoji: 1 });

export default mongoose.models.ProcessedBill || mongoose.model<IProcessedBill>('ProcessedBill', processedBillSchema); 