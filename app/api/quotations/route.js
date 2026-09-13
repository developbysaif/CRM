import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Quotation from '@/models/Quotation';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

function generateFallbackItems(lead) {
  const projectType = lead?.projectType || 'Website';
  return [
    {
      service: `${projectType} Architecture & UI/UX Design`,
      description: 'Wireframing, interactive prototype, responsive design system in Figma',
      quantity: 1,
      unitPrice: 3500,
      total: 3500,
    },
    {
      service: 'Full-Stack Frontend & Backend Engineering',
      description: 'Next.js 15, RESTful APIs, Mongoose data modeling, state management',
      quantity: 1,
      unitPrice: 8500,
      total: 8500,
    },
    {
      service: 'AI Consultant & Automation Integration',
      description: 'Conversational lead qualification engine, OpenAI API integration',
      quantity: 1,
      unitPrice: 3200,
      total: 3200,
    },
    {
      service: 'Secure Cloud Deployment, QA & DevOps',
      description: 'Docker containerization, CI/CD pipeline, SSL, CDN and server setup',
      quantity: 1,
      unitPrice: 1800,
      total: 1800,
    },
  ];
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, items, discount = 0, tax = 10, currency = 'USD', notes, terms } = body;

    if (!leadId) return apiError('Lead ID is required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    let quotationItems = items;

    if (!items || items.length === 0) {
      let apiKey = process.env.OPENAI_API_KEY;
      try {
        const settings = await Settings.findOne();
        if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
      } catch {}

      if (apiKey && apiKey.startsWith('sk-')) {
        try {
          const openai = new OpenAI({ apiKey });
          const prompt = `Generate a detailed quotation item list for a ${lead.projectType} project for "${lead.company || lead.name}". Return JSON: { "items": [{"service": "...", "description": "...", "quantity": 1, "unitPrice": 5000, "total": 5000}] }`;
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 800,
            response_format: { type: 'json_object' },
          });
          const generated = JSON.parse(completion.choices[0].message.content);
          if (Array.isArray(generated.items) && generated.items.length > 0) {
            quotationItems = generated.items;
          }
        } catch (err) {
          console.warn('OpenAI quotation error, using fallback:', err.message);
        }
      }

      if (!quotationItems || quotationItems.length === 0) {
        quotationItems = generateFallbackItems(lead);
      }
    }

    const subtotal = quotationItems.reduce((sum, item) => sum + (Number(item.total) || Number(item.unitPrice) * Number(item.quantity || 1)), 0);
    const discountAmount = Number(discount) || 0;
    const taxRate = Number(tax) || 0;
    const taxAmount = Math.round(((subtotal - discountAmount) * taxRate) / 100);
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
      currency,
      notes: notes || 'All prices quoted in USD. 30-day price lock guarantee.',
      terms: terms || 'Payment Schedule: 40% advance deposit, 40% milestone completion, 20% final sign-off.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      sentAt: new Date(),
    });

    await Lead.findByIdAndUpdate(leadId, { quotationId: quotation._id });

    await ActivityLog.create({
      leadId: lead._id,
      action: 'quotation_created',
      title: `💰 Quotation Generated: ${quotation.quotationNumber}`,
      description: `Total amount: $${total.toLocaleString()} for ${lead.name}`,
    });

    await Notification.create({
      type: 'new_lead',
      title: `💰 Quotation ${quotation.quotationNumber} Created`,
      message: `Quotation for ${lead.name} ($${total.toLocaleString()})`,
      link: `/quotations/${quotation._id}`,
    });

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
