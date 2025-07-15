import BillTopic from '@/models/BillTopic';
import connectDB from './database';

export interface BillCategory {
  topic: string;
  emoji: string;
  confidence: number;
}

export async function categorizeBill(billTitle: string, billText: string): Promise<BillCategory> {
  try {
    await connectDB();
    
    // Get all topics from database
    const topics = await BillTopic.find({});
    
    if (topics.length === 0) {
      // Fallback if no topics are seeded
      return {
        topic: 'Other',
        emoji: '📋',
        confidence: 0.5
      };
    }

    const searchText = `${billTitle} ${billText}`.toLowerCase();
    let bestMatch = {
      topic: 'Other',
      emoji: '📋',
      confidence: 0
    };

    // Check each topic's keywords against the bill content
    for (const topic of topics) {
      let matchCount = 0;
      const totalKeywords = topic.keywords.length;

      for (const keyword of topic.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }

      const confidence = matchCount / totalKeywords;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          topic: topic.name,
          emoji: topic.emoji,
          confidence
        };
      }
    }

    // If no good match found, use "Other"
    if (bestMatch.confidence < 0.1) {
      bestMatch = {
        topic: 'Other',
        emoji: '📋',
        confidence: 0.5
      };
    }

    return bestMatch;
  } catch (error) {
    console.error('Error categorizing bill:', error);
    return {
      topic: 'Other',
      emoji: '📋',
      confidence: 0.5
    };
  }
} 