import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import { apiSuccess, apiError } from '@/lib/api';
import { checkLeadDuplicate } from '@/lib/services/discovery/dedup.service';
import { calculateLeadScore, explainLeadValue } from '@/lib/services/scoring/lead-scoring.service';

/**
 * Normalizes raw input keys into standard Lead schema fields
 */
function normalizeRow(row) {
  const findVal = (keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
    }
    return '';
  };

  const name = findVal(['name', 'Name', 'full_name', 'Full Name', 'contact_name', 'Contact Name', 'contactPerson']);
  const company = findVal(['company', 'Company', 'company_name', 'Company Name', 'business_name', 'Business Name']);
  const email = findVal(['email', 'Email', 'email_address', 'Email Address']).toLowerCase();
  const phone = findVal(['phone', 'Phone', 'telephone', 'Telephone', 'mobile', 'Mobile', 'phone_number']);
  const website = findVal(['website', 'Website', 'url', 'URL', 'domain', 'Domain']);
  const industry = findVal(['industry', 'Industry', 'category', 'Category', 'sector', 'Sector']) || 'General';
  const city = findVal(['city', 'City', 'location', 'Location']);
  const country = findVal(['country', 'Country']);
  const budgetRaw = findVal(['budget', 'Budget', 'estimated_budget', 'Estimated Budget']) || '$5,000 - $15,000';
  const pipelineStatus = findVal(['status', 'Status', 'pipeline_status', 'Pipeline Status', 'stage', 'Stage']) || 'New Lead';

  return {
    name: name || company || 'Imported Prospect',
    company: company || name || '',
    companyName: company || name || '',
    email: email || null,
    phone: phone || null,
    website: website || null,
    domain: website ? website.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase() : null,
    industry,
    city: city || null,
    country: country || '',
    budget: { raw: budgetRaw, min: 5000, max: 15000, currency: 'USD' },
    pipelineStatus,
    source: 'File Import (CSV/JSON)',
  };
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leads = [] } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return apiError('Invalid request. Expected non-empty "leads" array.', 400);
    }

    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const insertedLeads = [];

    for (const raw of leads) {
      try {
        const normalized = normalizeRow(raw);

        // Check for duplicates
        const dupCheck = await checkLeadDuplicate(normalized);
        if (dupCheck.isDuplicate) {
          duplicateCount++;
          continue;
        }

        // Calculate lead scoring
        const scoring = calculateLeadScore(normalized);
        normalized.leadScore = scoring.score || 65;
        normalized.leadStatus = scoring.status || 'Warm';
        normalized.whyValuable = explainLeadValue(normalized, scoring.breakdown || {});

        const created = await Lead.create(normalized);
        insertedLeads.push(created);
        importedCount++;

        // Log import activity
        await ActivityLog.create({
          leadId: created._id,
          action: 'lead_imported',
          title: '📥 Lead Imported via File Upload',
          description: `${created.name} (${created.company || 'Enterprise'}) imported into ${created.pipelineStatus}. Score: ${created.leadScore}/100`,
        });
      } catch (err) {
        console.error('Row import error:', err);
        errorCount++;
      }
    }

    return apiSuccess({
      totalProcessed: leads.length,
      importedCount,
      duplicateCount,
      errorCount,
      sampleImported: insertedLeads.slice(0, 3).map(l => ({ id: l._id, name: l.name, company: l.company })),
    }, `Import completed: ${importedCount} leads created, ${duplicateCount} duplicates filtered out.`);
  } catch (error) {
    console.error('Batch Import API Error:', error);
    return apiError(error.message || 'Failed to process file import', 500);
  }
}
