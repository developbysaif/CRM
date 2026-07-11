import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { myWebsite, competitorWebsite } = body;

    if (!myWebsite || !competitorWebsite) {
      return apiError('Both websites are required', 400);
    }

    const prompt = `Perform a competitor analysis between these two websites:
My Website: ${myWebsite}
Competitor: ${competitorWebsite}

Return a comprehensive JSON analysis:
{
  "myWebsite": "${myWebsite}",
  "competitorWebsite": "${competitorWebsite}",
  "featureComparison": {
    "myFeatures": ["feature1", "feature2"],
    "competitorFeatures": ["feature1", "feature2"],
    "uniqueToMe": ["feature"],
    "uniqueToCompetitor": ["feature"],
    "commonFeatures": ["feature"]
  },
  "seoComparison": {
    "myScore": number,
    "competitorScore": number,
    "myStrengths": ["strength"],
    "competitorStrengths": ["strength"],
    "myWeaknesses": ["weakness"]
  },
  "performanceComparison": {
    "myScore": number,
    "competitorScore": number,
    "analysis": "detailed comparison"
  },
  "designComparison": {
    "myRating": number,
    "competitorRating": number,
    "myStrengths": ["strength"],
    "competitorStrengths": ["strength"],
    "improvements": ["improvement"]
  },
  "businessOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "missingFeatures": ["feature I should add"],
  "improvementSuggestions": ["suggestion1", "suggestion2"],
  "overallAdvantage": "me|competitor|equal",
  "executiveSummary": "2-3 paragraph executive summary of the comparison"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return apiSuccess(analysis, 'Competitor analysis completed');
  } catch (error) {
    console.error('Competitor analysis error:', error);
    return apiError('Failed to analyze competitors: ' + error.message, 500);
  }
}
