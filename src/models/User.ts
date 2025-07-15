import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  email: string;
  password: string;
  votes: Array<{
    billId: string;
    vote: 'upvote' | 'downvote';
    createdAt: Date;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getVoteForBill(billId: string): 'upvote' | 'downvote' | null;
  updateVote(billId: string, vote: 'upvote' | 'downvote'): void;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  votes: [{
    billId: {
      type: String,
      required: true,
    },
    vote: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's vote for a bill
userSchema.methods.getVoteForBill = function(billId: string) {
  const vote = this.votes.find(v => v.billId === billId);
  return vote ? vote.vote : null;
};

// Method to update vote
userSchema.methods.updateVote = function(billId: string, vote: 'upvote' | 'downvote') {
  const existingVoteIndex = this.votes.findIndex(v => v.billId === billId);
  
  if (existingVoteIndex >= 0) {
    // Update existing vote
    this.votes[existingVoteIndex].vote = vote;
    this.votes[existingVoteIndex].createdAt = new Date();
  } else {
    // Add new vote
    this.votes.push({ billId, vote, createdAt: new Date() });
  }
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 