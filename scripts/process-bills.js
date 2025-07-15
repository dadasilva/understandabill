#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { processNewBills } = require('../dist/lib/bill-processor');

async function main() {
  console.log('Starting bill processing...');
  console.log('Time:', new Date().toISOString());
  
  try {
    const result = await processNewBills();
    
    console.log('Bill processing completed:');
    console.log('- Processed:', result.processed);
    console.log('- New bills:', result.newBills);
    console.log('- Errors:', result.errors.length);
    
    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach(error => console.log('-', error));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error in bill processing:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 