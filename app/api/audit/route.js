import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) return apiError('Website URL required', 400);

    const prompt = `Perform a comprehensive website audit analysis for: ${url}

Analyze based on best practices and return JSON:
{
  "url": "${url}",
  "overallScore": number (0-100),
  "performance": {
    "score": number,
    "grade": "A|B|C|D|F",
    "issues": ["issue1", "issue2"],
    "recommendations": ["rec1", "rec2"]
  },
  "seo": {
    "score": number,
    "grade": "A|B|C|D|F",
    "issues": ["issue1"],
    "recommendations": ["rec1"]
  },
  "accessibility": {
    "score": number,
    "grade": "A|B|C|D|F",
    "issues": [],
    "recommendations": []
  },
  "security": {
    "score": number,
    "grade": "A|B|C|D|F",
    "issues": [],
    "recommendations": []
  },
  "responsive": {
    "score": number,
    "grade": "A|B|C|D|F",
    "issues": [],
    "recommendations": []
  },
  "ux": {
    "score": number,
    "grade": "A|B|C|D|F",
    "issues": [],
    "recommendations": []
  },
  "coreWebVitals": {
    "lcp": {"value": "string", "status": "Good|Needs Improvement|Poor"},
    "fid": {"value": "string", "status": "Good|Needs Improvement|Poor"},
    "cls": {"value": "string", "status": "Good|Needs Improvement|Poor"}
  },
  "summary": "Overall summary of the website audit",
  "priorityActions": ["Most important action 1", "action 2", "action 3"],
  "estimatedImprovementCost": "e.g., $2,000 - $5,000"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const audit = JSON.parse(completion.choices[0].message.content);
    return apiSuccess(audit, 'Website audit completed');
  } catch (error) {
    console.error('Audit error:', error);
    return apiError('Failed to audit website: ' + error.message, 500);
  }
}
