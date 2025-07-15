require('dotenv').config({ path: '.env.local' });

const axios = require('axios');

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const BASE_URL = 'https://api.congress.gov/v3';

async function fetchSummary(summaryUrl) {
  try {
    const resp = await axios.get(summaryUrl, {
      params: { api_key: CONGRESS_API_KEY, format: 'json' }
    });
    if (resp.data.summaries && resp.data.summaries.length > 0) {
      return resp.data.summaries.map((s, i) => `- [${i + 1}] ${s.text}`).join('\n');
    }
    return 'No summary available.';
  } catch (err) {
    return `Error fetching summary: ${err.message}`;
  }
}

async function fetchTextVersions(textVersionsUrl) {
  try {
    const resp = await axios.get(textVersionsUrl, {
      params: { api_key: CONGRESS_API_KEY, format: 'json' }
    });
    if (resp.data.textVersions && resp.data.textVersions.length > 0) {
      return resp.data.textVersions.map((tv, i) => `- [${i + 1}] ${tv.type} (${tv.format}): ${tv.url}`).join('\n');
    }
    return 'No text versions available.';
  } catch (err) {
    return `Error fetching text versions: ${err.message}`;
  }
}

async function findFirstEnactedBill() {
  let offset = 0;
  const limit = 20;
  let found = false;
  let page = 1;

  while (!found) {
    console.log(`\n🔎 Fetching bills (page ${page}, offset ${offset})...`);
    const response = await axios.get(`${BASE_URL}/bill/119`, {
      params: {
        api_key: CONGRESS_API_KEY,
        limit,
        offset,
        format: 'json'
      }
    });

    const bills = response.data.bills;
    if (!bills || bills.length === 0) {
      console.log('No more bills found.');
      break;
    }

    for (const bill of bills) {
      if (bill.latestAction?.text?.includes('Became Public Law')) {
        console.log('\n✅ Found enacted bill!');
        console.log('Full bill object:');
        console.dir(bill, { depth: null, colors: true });
        console.log('\nPulled fields:');
        console.log(`Bill ID: ${bill.billId}`);
        console.log(`Title: ${bill.title}`);
        console.log(`Latest Action: ${bill.latestAction.text}`);
        console.log(`Date: ${bill.latestAction.date}`);
        console.log(`Congress: ${bill.congress}`);
        console.log(`Bill Type: ${bill.billType}`);
        console.log(`Bill Number: ${bill.billNumber}`);
        console.log(`Type: ${bill.type}`);
        console.log(`Number: ${bill.number}`);
        console.log(`URL: ${bill.url}`);

        // Fetch full bill details
        if (bill.congress && bill.type && bill.number) {
          try {
            const detailsUrl = `${BASE_URL}/bill/${bill.congress}/${bill.type.toLowerCase()}/${bill.number}`;
            console.log(`\n🔗 Fetching full details: ${detailsUrl}`);
            const detailsResp = await axios.get(detailsUrl, {
              params: {
                api_key: CONGRESS_API_KEY,
                format: 'json'
              }
            });
            const details = detailsResp.data.bill;
            console.log('\n📄 Full Bill Details:');
            console.dir(details, { depth: null, colors: true });

            // Fetch and print summary
            if (details.summaries && details.summaries.url) {
              console.log('\n📝 Fetching summary...');
              const summaryText = await fetchSummary(details.summaries.url);
              console.log(summaryText);
            } else {
              console.log('No summary available.');
            }

            // Fetch and print text versions
            if (details.textVersions && details.textVersions.url) {
              console.log('\n📚 Fetching text versions...');
              const textVersionsText = await fetchTextVersions(details.textVersions.url);
              console.log(textVersionsText);
            } else {
              console.log('No text versions available.');
            }
          } catch (err) {
            console.error('❌ Error fetching bill details:', err.message);
          }
        } else {
          console.log('⚠️  Missing fields for detail lookup.');
        }
        found = true;
        break;
      }
    }

    if (found) break;
    offset += limit;
    page++;
    // To avoid hitting rate limits, you can add a delay here if needed
  }

  if (!found) {
    console.log('❌ No enacted bills found in the searched range.');
  }
}

findFirstEnactedBill(); 