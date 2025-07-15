import { NextResponse } from 'next/server';
import { processMostRecentBill } from '@/lib/bill-processor';

export async function POST() {
  try {
    // In a production app, you'd want to add authentication here
    // For now, we'll allow manual triggering
    
    console.log('Manual bill processing triggered - processing most recent bill');
    
    const result = await processMostRecentBill();
    
    return NextResponse.json({
      message: 'Most recent bill processing completed',
      result
    });

  } catch (error) {
    console.error('Error in manual bill processing:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 