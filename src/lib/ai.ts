import axios from 'axios';

export interface SummarizationResponse {
  summary: string;
  success: boolean;
  error?: string;
}

export async function summarizeBill(billText: string): Promise<SummarizationResponse> {
  const prompt = `Summarize this U.S. bill in under 200 words, neutrally and clearly, focusing on key provisions, impacts, and why it matters: ${billText}`;

  try {
    // Try xAI first
    if (process.env.XAI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'x-1',
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
              'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const summary = response.data.choices[0]?.message?.content?.trim();
        if (summary) {
          return { summary, success: true };
        }
      } catch (xaiError) {
        console.warn('xAI API failed, trying OpenAI fallback:', xaiError);
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
        return { summary, success: true };
      }
    }

    throw new Error('No AI API keys configured');
  } catch (error) {
    console.error('AI summarization failed:', error);
    return {
      summary: 'Unable to generate summary at this time.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 