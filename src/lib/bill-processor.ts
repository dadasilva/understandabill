import { fetchBills, fetchBillDetails, fetchBillText, isEnactedBill, Bill } from './congress-api';
import { summarizeBill } from './ai';
import { categorizeBill } from './bill-categorizer';
import { sendNotificationsToAllSubscribers } from './notifications';
import ProcessedBill from '@/models/ProcessedBill';
import connectDB from './database';

const CURRENT_CONGRESS = 119; // Update this as needed

export interface ProcessingResult {
  processed: number;
  newBills: number;
  errors: string[];
}

async function processSingleBill(bill: Bill, result: ProcessingResult): Promise<void> {
  console.log(`Processing bill: ${bill.billId}`);
  
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
    console.log(`Using fallback summary for ${bill.billId}: ${summaryResult.error}`);
    // Don't return - continue with the fallback summary
  }

  // Categorize the bill
  const category = await categorizeBill(bill.title, billText);
  console.log(`Categorized bill ${bill.billId} as: ${category.emoji} ${category.topic} (confidence: ${category.confidence})`);
  
  // Save to database
  const enactedDate = new Date(bill.latestAction.date);
  const processedBill = new ProcessedBill({
    billId: bill.billId,
    congress: bill.congress,
    billType: bill.billType,
    billNumber: bill.billNumber,
    title: bill.title,
    summary: summaryResult.summary,
    enactedDate: enactedDate,
    processedAt: new Date(),
    topic: category.topic,
    emoji: summaryResult.emoji || category.emoji
  });
  
  console.log(`Saving bill ${bill.billId} to database...`);
  await processedBill.save();
  console.log(`Successfully saved bill ${bill.billId} to database`);
  
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
}

// Function to process the most recent bill with pagination
export async function processMostRecentBill(): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    newBills: 0,
    errors: []
  };

  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');
    
    // Check current database state
    const existingCount = await ProcessedBill.countDocuments();
    console.log(`Current database has ${existingCount} processed bills`);
    
    let offset = 0;
    const limit = 20; // Fetch 20 bills at a time
    let foundUnprocessedBill = false;
    const maxPages = 10; // Limit to prevent infinite loops
    let currentPage = 0;
    
    console.log('Searching for the most recent unprocessed bill...');
    
    while (!foundUnprocessedBill && currentPage < maxPages) {
      console.log(`Fetching bills page ${currentPage + 1} (offset: ${offset})`);
      
      const billsResponse = await fetchBills(CURRENT_CONGRESS, offset, limit);
      console.log(`Fetched ${billsResponse.bills.length} bills from page ${currentPage + 1}`);
      
      // Log a few sample bills to see their structure
      if (currentPage === 0) {
        console.log('Sample bills:');
        billsResponse.bills.slice(0, 3).forEach(bill => {
          console.log(`- Bill ID: "${bill.billId}"`);
          console.log(`  Congress: ${bill.congress}, Type: ${bill.billType}, Number: ${bill.billNumber}`);
          console.log(`  Title: "${bill.title}"`);
          console.log(`  Latest action: ${bill.latestAction?.text || 'None'}`);
          console.log(`  Raw bill object:`, JSON.stringify(bill, null, 2));
        });
      }
      
      // Process all bills, not just enacted ones
      const allBills = billsResponse.bills;
      console.log(`Found ${allBills.length} bills on this page`);
      
      if (allBills.length === 0) {
        console.log('No bills found on this page');
        // Continue to next page instead of breaking immediately
        offset += limit;
        currentPage++;
        
        // If we've reached the end of available bills, stop
        if (!billsResponse.pagination.next) {
          console.log('Reached end of available bills');
          break;
        }
        continue;
      }
      
      // Check each bill in this page to see if it's been processed
      for (const bill of allBills) {
        // Skip bills with invalid IDs
        if (!bill.billId || bill.billId === 'undefined' || !bill.congress || !bill.billType || !bill.billNumber) {
          console.log(`Skipping bill with invalid data:`, {
            billId: bill.billId,
            congress: bill.congress,
            billType: bill.billType,
            billNumber: bill.billNumber
          });
          continue;
        }
        
        const existing = await ProcessedBill.findOne({ billId: bill.billId });
        
        if (!existing) {
          console.log(`Found unprocessed bill: ${bill.billId} - ${bill.title}`);
          console.log(`Processing most recent bill: ${bill.billId}`);
          await processSingleBill(bill, result);
          foundUnprocessedBill = true;
          break;
        } else {
          console.log(`Bill ${bill.billId} already processed, checking next...`);
        }
      }
      
      // If we didn't find an unprocessed bill on this page, move to the next page
      if (!foundUnprocessedBill) {
        offset += limit;
        currentPage++;
        
        // If we've reached the end of available bills, stop
        if (!billsResponse.pagination.next) {
          console.log('Reached end of available bills');
          break;
        }
      }
    }
    
    if (!foundUnprocessedBill) {
      console.log('No unprocessed bills found');
    }
    
  } catch (error) {
    const errorMsg = `Error processing most recent bill: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }
  
  return result;
}

// Function to process a random enacted bill
export async function processRandomBill(): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    newBills: 0,
    errors: []
  };

  try {
    await connectDB();
    
    // Fetch more bills to have a better selection
    const billsResponse = await fetchBills(CURRENT_CONGRESS, 0, 50);
    const enactedBills = billsResponse.bills.filter(isEnactedBill);
    
    if (enactedBills.length === 0) {
      console.log('No enacted bills found');
      return result;
    }
    
    // Pick a random bill from the enacted bills
    const randomIndex = Math.floor(Math.random() * enactedBills.length);
    const randomBill = enactedBills[randomIndex];
    
    // Check if already processed
    const existing = await ProcessedBill.findOne({ billId: randomBill.billId });
    if (existing) {
      console.log(`Random bill ${randomBill.billId} already processed, trying another...`);
      // Try to find an unprocessed bill
      const unprocessedBills = enactedBills.filter(bill => 
        !ProcessedBill.findOne({ billId: bill.billId })
      );
      
      if (unprocessedBills.length === 0) {
        console.log('All bills have been processed');
        return result;
      }
      
      const newRandomIndex = Math.floor(Math.random() * unprocessedBills.length);
      const newRandomBill = unprocessedBills[newRandomIndex];
      console.log(`Processing random unprocessed bill: ${newRandomBill.billId}`);
      await processSingleBill(newRandomBill, result);
    } else {
      console.log(`Processing random enacted bill: ${randomBill.billId}`);
      await processSingleBill(randomBill, result);
    }
    
  } catch (error) {
    const errorMsg = `Error processing random bill: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }
  
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