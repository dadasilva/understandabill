import { fetchBills, fetchBillDetails, fetchBillText, isEnactedBill } from './congress-api';
import { summarizeBill } from './ai';
import { sendNotificationsToAllSubscribers } from './notifications';
import ProcessedBill from '@/models/ProcessedBill';
import connectDB from './database';

const CURRENT_CONGRESS = 119; // Update this as needed

export interface ProcessingResult {
  processed: number;
  newBills: number;
  errors: string[];
}

export async function processNewBills(): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    newBills: 0,
    errors: []
  };

  try {
    await connectDB();
    
    // Get the last processed timestamp
    const lastProcessed = await ProcessedBill.findOne().sort({ processedAt: -1 });
    const lastProcessedDate = lastProcessed?.processedAt || new Date(0);
    
    console.log(`Processing bills since: ${lastProcessedDate}`);
    
    // Fetch recent bills
    const billsResponse = await fetchBills(CURRENT_CONGRESS, 0, 50);
    const enactedBills = billsResponse.bills.filter(isEnactedBill);
    
    console.log(`Found ${enactedBills.length} enacted bills`);
    
    for (const bill of enactedBills) {
      try {
        // Check if already processed
        const existing = await ProcessedBill.findOne({ billId: bill.billId });
        if (existing) {
          console.log(`Bill ${bill.billId} already processed, skipping`);
          continue;
        }
        
        // Check if bill was enacted after our last processing
        const enactedDate = new Date(bill.latestAction.date);
        if (enactedDate <= lastProcessedDate) {
          console.log(`Bill ${bill.billId} enacted before last processing, skipping`);
          continue;
        }
        
        console.log(`Processing new bill: ${bill.billId}`);
        
        // Get full bill details
        const billDetails = await fetchBillDetails(bill.congress, bill.billType, bill.billNumber);
        
        // Get bill text if available
        let billText = '';
        if (billDetails.textVersions && billDetails.textVersions.length > 0) {
          const textVersion = billDetails.textVersions.find(v => v.format === 'xml');
          if (textVersion) {
            try {
              billText = await fetchBillText(textVersion.url);
            } catch (error) {
              console.warn(`Failed to fetch text for ${bill.billId}:`, error);
              billText = billDetails.title; // Fallback to title
            }
          }
        }
        
        // If no text available, use title
        if (!billText) {
          billText = billDetails.title;
        }
        
        // Summarize the bill
        const summaryResult = await summarizeBill(billText);
        
        if (!summaryResult.success) {
          result.errors.push(`Failed to summarize ${bill.billId}: ${summaryResult.error}`);
          continue;
        }
        
        // Save to database
        const processedBill = new ProcessedBill({
          billId: bill.billId,
          congress: bill.congress,
          billType: bill.billType,
          billNumber: bill.billNumber,
          title: bill.title,
          summary: summaryResult.summary,
          enactedDate: enactedDate,
          processedAt: new Date()
        });
        
        await processedBill.save();
        
        // Send notifications
        const notificationResult = await sendNotificationsToAllSubscribers({
          title: `New Bill: ${bill.title}`,
          body: summaryResult.summary,
          billId: bill.billId,
          congress: bill.congress
        });
        
        console.log(`Sent notifications for ${bill.billId}: ${notificationResult.success} success, ${notificationResult.failed} failed`);
        
        result.newBills++;
        result.processed++;
        
      } catch (error) {
        const errorMsg = `Error processing bill ${bill.billId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }
    
  } catch (error) {
    const errorMsg = `Error in bill processing: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }
  
  console.log(`Bill processing complete: ${result.newBills} new bills, ${result.errors.length} errors`);
  return result;
}

// Function to manually process a specific bill (for testing)
export async function processSpecificBill(billId: string): Promise<boolean> {
  try {
    await connectDB();
    
    // Check if already processed
    const existing = await ProcessedBill.findOne({ billId });
    if (existing) {
      console.log(`Bill ${billId} already processed`);
      return false;
    }
    
    // Parse bill ID to get congress, type, and number
    const parts = billId.split('-');
    if (parts.length !== 3) {
      throw new Error(`Invalid bill ID format: ${billId}`);
    }
    
    const [congress, billType, billNumber] = parts;
    
    // Get bill details
    const billDetails = await fetchBillDetails(parseInt(congress), billType, billNumber);
    
    if (!isEnactedBill(billDetails)) {
      console.log(`Bill ${billId} is not enacted`);
      return false;
    }
    
    // Process the bill (reuse logic from processNewBills)
    // ... (similar processing logic)
    
    return true;
  } catch (error) {
    console.error(`Error processing specific bill ${billId}:`, error);
    return false;
  }
} 