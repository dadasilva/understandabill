import axios from 'axios';
import * as xml2js from 'xml2js';

export interface Bill {
  billId: string;
  congress: number;
  billType: string;
  billNumber: string;
  title: string;
  latestAction: {
    text: string;
    date: string;
  };
  textVersions?: Array<{
    url: string;
    format: string;
  }>;
  // Raw API fields
  type?: string;
  number?: string;
  actionDate?: string;
  updateDate?: string;
  url?: string;
}

export interface CongressApiResponse {
  bills: Bill[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const BASE_URL = 'https://api.congress.gov/v3';

if (!CONGRESS_API_KEY) {
  throw new Error('CONGRESS_API_KEY environment variable is required');
}

export async function fetchBills(congress: number, offset = 0, limit = 20): Promise<CongressApiResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/bill/${congress}`, {
      params: {
        api_key: CONGRESS_API_KEY,
        offset,
        limit,
        format: 'json'
      }
    });

    // Map the API response to our expected format
    const bills = response.data.bills.map((bill: Record<string, unknown>) => {
      const latestAction = bill.latestAction as Record<string, unknown> | undefined;
      return {
        billId: `${bill.congress}-${bill.type}-${bill.number}`,
        congress: bill.congress,
        billType: bill.type,
        billNumber: bill.number,
        title: bill.title,
        latestAction: {
          text: latestAction?.text as string || '',
          date: latestAction?.actionDate as string || bill.updateDate as string || ''
        },
        // Keep raw fields for debugging
        type: bill.type,
        number: bill.number,
        actionDate: latestAction?.actionDate as string,
        updateDate: bill.updateDate as string,
        url: bill.url as string
      };
    });

    return {
      bills,
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw new Error('Failed to fetch bills from Congress.gov API');
  }
}

export async function fetchBillDetails(congress: number, billType: string, billNumber: string): Promise<Bill> {
  try {
    const response = await axios.get(`${BASE_URL}/bill/${congress}/${billType}/${billNumber}`, {
      params: {
        api_key: CONGRESS_API_KEY,
        format: 'json'
      }
    });

    const bill = response.data.bill;
    
    // Map the detailed response to our expected format
    return {
      billId: `${bill.congress}-${bill.type}-${bill.number}`,
      congress: bill.congress,
      billType: bill.type,
      billNumber: bill.number,
      title: bill.title,
      latestAction: {
        text: bill.latestAction?.text || '',
        date: bill.latestAction?.actionDate || bill.updateDate || ''
      },
      textVersions: bill.textVersions?.url ? [{
        url: bill.textVersions.url,
        format: 'xml'
      }] : undefined,
      // Keep raw fields for debugging
      type: bill.type,
      number: bill.number,
      actionDate: bill.latestAction?.actionDate,
      updateDate: bill.updateDate,
      url: bill.url
    };
  } catch (error) {
    console.error('Error fetching bill details:', error);
    throw new Error(`Failed to fetch bill details for ${congress}/${billType}/${billNumber}`);
  }
}

export async function fetchBillText(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      params: {
        api_key: CONGRESS_API_KEY
      }
    });

    // Parse XML to extract text content
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    
    // Extract text from the XML structure
    const text = extractTextFromXml(result);
    return text;
  } catch (error) {
    console.error('Error fetching bill text:', error);
    throw new Error('Failed to fetch bill text');
  }
}

function extractTextFromXml(xmlObj: Record<string, unknown>): string {
  // Navigate through the XML structure to find the text content
  // This is a simplified version - you may need to adjust based on actual XML structure
  const bill = xmlObj.bill as Record<string, unknown> | undefined;
  const text = bill?.text as Record<string, unknown> | undefined;
  const form = text?.form as Record<string, unknown> | undefined;
  
  if (form?.text) {
    return form.text as string;
  }
  
  if (form?.div) {
    return extractTextFromDiv(form.div);
  }
  
  return 'Text content not found';
}

function extractTextFromDiv(div: unknown): string {
  if (typeof div === 'string') {
    return div;
  }
  
  if (Array.isArray(div)) {
    return div.map(d => extractTextFromDiv(d)).join(' ');
  }
  
  if (div && typeof div === 'object' && div !== null) {
    let text = '';
    const divObj = div as Record<string, unknown>;
    for (const key in divObj) {
      if (key === 'text' || key === 'p' || key === 'span') {
        text += extractTextFromDiv(divObj[key]) + ' ';
      }
    }
    return text.trim();
  }
  
  return '';
}

export function isEnactedBill(bill: Bill): boolean {
  const actionText = bill.latestAction?.text || '';
  const isEnacted = actionText.includes('Became Public Law') || 
                   actionText.includes('Signed by President') ||
                   actionText.includes('Presented to President') ||
                   actionText.includes('Enacted');
  
  // Debug logging for the first few bills
  if (Math.random() < 0.1) { // Log ~10% of bills for debugging
    console.log(`Bill ${bill.billId} action: "${actionText}" -> Enacted: ${isEnacted}`);
  }
  
  return isEnacted;
} 