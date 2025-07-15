import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import ProcessedBill from '@/models/ProcessedBill';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const congress = searchParams.get('congress');

    await connectDB();

    // Build query
    const query: { congress?: number } = {};
    if (congress) {
      query.congress = parseInt(congress);
    }

    // Get bills with pagination
    const bills = await ProcessedBill.find(query)
      .sort({ enactedDate: -1 })
      .skip(offset)
      .limit(Math.min(limit, 50)) // Cap at 50
      .select('-__v')
      .lean();

    // Get total count
    const total = await ProcessedBill.countDocuments(query);

    return NextResponse.json({
      bills,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + bills.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 