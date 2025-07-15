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
}, {
  timestamps: true,
});

// Create indexes for faster queries
processedBillSchema.index({ billId: 1 });
processedBillSchema.index({ enactedDate: -1 });
processedBillSchema.index({ processedAt: -1 });

export default mongoose.models.ProcessedBill || mongoose.model<IProcessedBill>('ProcessedBill', processedBillSchema); 