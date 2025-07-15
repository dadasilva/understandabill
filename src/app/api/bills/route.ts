import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import ProcessedBill from '@/models/ProcessedBill';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    await connectDB();

    // Get current user if authenticated
    const user = await getCurrentUser();

    // Get bills with pagination
    const bills = await ProcessedBill.find()
      .sort({ enactedDate: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await ProcessedBill.countDocuments();

    // If user is authenticated, get their votes for these bills
    let billsWithVotes = bills;
    if (user) {
      const userVotes = await User.findById(user._id)
        .select('votes')
        .lean();

      if (userVotes) {
        const voteMap = new Map(
          userVotes.votes.map((vote: any) => [vote.billId, vote.vote])
        );

        billsWithVotes = bills.map(bill => ({
          ...bill,
          userVote: voteMap.get(bill.billId) || null
        }));
      }
    } else {
      // Add null userVote for unauthenticated users
      billsWithVotes = bills.map(bill => ({
        ...bill,
        userVote: null
      }));
    }

    return NextResponse.json({
      bills: billsWithVotes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 