import { NextResponse } from 'next/server';
import { processMostRecentBill } from '@/lib/bill-processor';

export async function POST() {
  try {
    console.log('Processing most recent bill triggered');
    
    const result = await processMostRecentBill();
    
    return NextResponse.json({
      message: 'Most recent bill processing completed',
      result
    });

  } catch (error) {
    console.error('Error in most recent bill processing:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 