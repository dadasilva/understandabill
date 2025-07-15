import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import ProcessedBill from '@/models/ProcessedBill';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ billId: string }> }) {
  try {
    const { billId } = await params;
    const { action } = await request.json();
    
    if (!['upvote', 'downvote'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    
    // Get bill
    const bill = await ProcessedBill.findOne({ billId });
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Get user with votes
    const userWithVotes = await User.findById(user._id);
    if (!userWithVotes) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's previous vote for this bill
    const previousVote = userWithVotes.getVoteForBill(billId);
    
    // Update vote counts
    if (previousVote === action) {
      // User is voting the same way again - remove the vote
      if (action === 'upvote') {
        bill.upvotes = Math.max(0, (bill.upvotes || 0) - 1);
      } else {
        bill.downvotes = Math.max(0, (bill.downvotes || 0) - 1);
      }
      // Remove vote from user
      userWithVotes.votes = userWithVotes.votes.filter(v => v.billId !== billId);
    } else {
      // User is changing vote or voting for the first time
      if (previousVote === 'upvote') {
        bill.upvotes = Math.max(0, (bill.upvotes || 0) - 1);
      } else if (previousVote === 'downvote') {
        bill.downvotes = Math.max(0, (bill.downvotes || 0) - 1);
      }
      
      if (action === 'upvote') {
        bill.upvotes = (bill.upvotes || 0) + 1;
      } else {
        bill.downvotes = (bill.downvotes || 0) + 1;
      }
      
      // Update user's vote
      userWithVotes.updateVote(billId, action);
    }

    // Save both documents
    await Promise.all([bill.save(), userWithVotes.save()]);

    return NextResponse.json({
      upvotes: bill.upvotes,
      downvotes: bill.downvotes,
      score: (bill.upvotes || 0) - (bill.downvotes || 0),
      userVote: userWithVotes.getVoteForBill(billId)
    });
  } catch (error) {
    console.error('Error voting on bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 