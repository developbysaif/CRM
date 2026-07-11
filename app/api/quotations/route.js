import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Quotation from '@/models/Quotation';
import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, items, discount, tax, currency, notes, terms } = body;

    if (!leadId) return apiError('Lead ID required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    let quotationItems = items;

    // If no items provided, generate with AI
    if (!items || items.length === 0) {
      const prompt = `Generate a detailed quotation for a ${lead.projectType} project for a ${lead.businessType} business named "${lead.company || lead.name}".
Budget range: ${lead.budget?.raw || 'Not specified'}
Features needed: ${lead.expectedFeatures?.join(', ') || 'Standard features'}

Return JSON:
{
  "items": [
    {"service": "Service Name", "description": "Brief description", "quantity": 1, "unitPrice": number, "total": number}
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const generated = JSON.parse(completion.choices[0].message.content);
      quotationItems = generated.items;
    }

    const subtotal = quotationItems.reduce((sum, item) => sum + (item.total || item.unitPrice * item.quantity), 0);
    const discountAmount = typeof discount === 'number' ? discount : 0;
    const taxRate = typeof tax === 'number' ? tax : 0;
    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
    const total = subtotal - discountAmount + taxAmount;

    const quotation = await Quotation.create({
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientCountry: lead.country || '',
      clientPhone: lead.phone || '',
      items: quotationItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      taxRate,
      total,
      currency: currency || 'USD',
      notes: notes || '',
      terms: terms || 'Payment due within 30 days of invoice. 50% upfront, 50% on delivery.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await Lead.findByIdAndUpdate(leadId, { quotationId: quotation._id });

    return apiSuccess(quotation, 'Quotation created successfully', 201);
  } catch (error) {
    console.error('Quotation error:', error);
    return apiError('Failed to create quotation: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const filter = leadId ? { leadId } : {};
    const quotations = await Quotation.find(filter).populate('leadId', 'name email company').sort({ createdAt: -1 });
    return apiSuccess(quotations);
  } catch (error) {
    return apiError('Failed to fetch quotations', 500);
  }
}
