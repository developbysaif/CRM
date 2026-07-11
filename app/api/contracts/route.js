import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Contract from '@/models/Contract';
import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, totalAmount, currency } = body;

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    const prompt = `Generate a professional software development service contract for:

Client: ${lead.name}
Company: ${lead.company || 'Individual'}
Email: ${lead.email}
Country: ${lead.country}
Project: ${lead.projectType} for ${lead.businessType} business
Total Amount: ${totalAmount || 'TBD'} ${currency || 'USD'}
Timeline: ${lead.deadline || 'As agreed'}

Return JSON with these fields:
{
  "ownershipClause": "intellectual property ownership clause text",
  "confidentialityClause": "NDA and confidentiality clause text",
  "supportClause": "support terms (e.g., 3 months free support)",
  "maintenanceClause": "maintenance terms",
  "terminationClause": "termination conditions",
  "governingLaw": "governing law and jurisdiction",
  "deliverables": ["deliverable1", "deliverable2"],
  "paymentSchedule": [
    {"milestone": "Project Kickoff", "amount": number, "status": "Pending"},
    {"milestone": "Midpoint Delivery", "amount": number, "status": "Pending"},
    {"milestone": "Final Delivery", "amount": number, "status": "Pending"}
  ],
  "projectDescription": "detailed project description"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const contractContent = JSON.parse(completion.choices[0].message.content);

    const contract = await Contract.create({
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientAddress: lead.country || '',
      clientPhone: lead.phone || '',
      projectName: `${lead.projectType} - ${lead.company || lead.name}`,
      totalAmount: totalAmount || 0,
      currency: currency || 'USD',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ...contractContent,
    });

    await Lead.findByIdAndUpdate(leadId, {
      contractId: contract._id,
      pipelineStatus: 'Contract Signed',
    });

    return apiSuccess(contract, 'Contract generated successfully', 201);
  } catch (error) {
    console.error('Contract error:', error);
    return apiError('Failed to generate contract: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const filter = leadId ? { leadId } : {};
    const contracts = await Contract.find(filter).populate('leadId', 'name email company').sort({ createdAt: -1 });
    return apiSuccess(contracts);
  } catch (error) {
    return apiError('Failed to fetch contracts', 500);
  }
}
