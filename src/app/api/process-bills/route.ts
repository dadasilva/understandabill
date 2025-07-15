import { NextResponse } from 'next/server';
import { processNewBills } from '@/lib/bill-processor';

export async function POST() {
  try {
    // In a production app, you'd want to add authentication here
    // For now, we'll allow manual triggering
    
    console.log('Manual bill processing triggered');
    
    const result = await processNewBills();
    
    return NextResponse.json({
      message: 'Bill processing completed',
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