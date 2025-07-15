import axios from 'axios';
import OpenAI from 'openai';

export interface SummarizationResponse {
  summary: string;
  success: boolean;
  error?: string;
  topic?: string;
  emoji?: string;
}

export async function summarizeBill(billText: string): Promise<SummarizationResponse> {
  const prompt = `Summarize this U.S. bill in under 200 words, neutrally and clearly, focusing on key provisions, impacts, and why it matters. Also suggest a relevant emoji that represents the main topic of this bill (just the emoji, no text): ${billText}`;

  try {
    // Try xAI first using OpenAI SDK
    if (process.env.XAI_API_KEY) {
      try {
        const xaiClient = new OpenAI({
          apiKey: process.env.XAI_API_KEY,
          baseURL: "https://api.x.ai/v1",
        });

        const completion = await xaiClient.chat.completions.create({
          model: "grok-3",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant that summarizes U.S. legislation clearly and neutrally.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0,
        });

        const summary = completion.choices[0]?.message?.content?.trim();
        if (summary) {
          console.log('xAI (Grok-3) summary generated successfully');
          
          // Extract emoji from the end of the summary if present
          const emojiMatch = summary.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
          const emoji = emojiMatch ? emojiMatch[0] : '📋';
          
          // Remove emoji from summary if it's at the end
          const cleanSummary = summary.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim();
          
          return { summary: cleanSummary, emoji, success: true };
        }
      } catch (xaiError) {
        console.warn('xAI API failed, trying OpenAI fallback:', xaiError);
        console.warn('xAI Error details:', {
          message: xaiError instanceof Error ? xaiError.message : 'Unknown error',
          status: (xaiError as { status?: number })?.status,
          type: (xaiError as { type?: string })?.type
        });
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.choices[0]?.message?.content?.trim();
      if (summary) {
        // Extract emoji from the end of the summary if present
        const emojiMatch = summary.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
        const emoji = emojiMatch ? emojiMatch[0] : '📋';
        
        // Remove emoji from summary if it's at the end
        const cleanSummary = summary.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim();
        
        return { summary: cleanSummary, emoji, success: true };
      }
    }

    // Fallback: Generate a basic summary from the title and first few sentences
    console.log('No AI API keys configured, generating basic summary');
    const words = billText.split(' ').slice(0, 50).join(' ');
    const basicSummary = `This bill appears to be about: ${words}... (Summary generated without AI assistance)`;
    
    return { summary: basicSummary, emoji: '📋', success: true };
  } catch (error) {
    console.error('AI summarization failed:', error);
    
    // Fallback: Generate a basic summary even when AI fails
    const words = billText.split(' ').slice(0, 50).join(' ');
    const basicSummary = `This bill appears to be about: ${words}... (Summary generated without AI assistance due to API error)`;
    
    console.log('Using fallback summary generation');
    return { summary: basicSummary, emoji: '📋', success: true };
  }
} 