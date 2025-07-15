import { NextResponse } from 'next/server';
import { processRandomBill } from '@/lib/bill-processor';

export async function POST() {
  try {
    console.log('Processing random bill triggered');
    
    const result = await processRandomBill();
    
    return NextResponse.json({
      message: 'Random bill processing completed',
      result
    });

  } catch (error) {
    console.error('Error in random bill processing:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 