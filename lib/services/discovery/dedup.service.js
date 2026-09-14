import connectDB from '@/lib/db';
import Lead from '@/models/Lead';

/**
 * Normalizes phone numbers to comparable digit string
 */
export function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? digits : null;
}

/**
 * Normalizes company name and address string for fuzzy matching
 */
export function normalizeCompanyAndAddress(company, address) {
  if (!company) return null;
  const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanAddress = (address || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  return `${cleanCompany}__${cleanAddress}`;
}

/**
 * Checks if a lead already exists in MongoDB based on the 5 required dedup criteria:
 * 1. email
 * 2. phone
 * 3. domain
 * 4. googlePlaceId
 * 5. company name + address
 *
 * @param {Object} candidate - Normalized lead candidate
 * @param {string} organizationId - Multi-tenant isolation ID
 * @returns {Promise<{ isDuplicate: boolean, existingLead: Object|null, reason: string|null }>}
 */
export async function checkLeadDuplicate(candidate, organizationId = 'org_default') {
  await connectDB();

  const orConditions = [];

  // 1. Check by email
  if (candidate.email) {
    orConditions.push({ email: candidate.email.toLowerCase().trim() });
  }

  // 2. Check by Google Place ID
  if (candidate.googlePlaceId) {
    orConditions.push({ googlePlaceId: candidate.googlePlaceId.trim() });
  }

  // 3. Check by Domain
  if (candidate.domain) {
    orConditions.push({ domain: candidate.domain.toLowerCase().trim() });
  }

  // 4. Check by Phone
  if (candidate.phone) {
    orConditions.push({ phone: candidate.phone.trim() });
  }

  if (orConditions.length > 0) {
    const found = await Lead.findOne({
      organizationId,
      $or: orConditions,
    }).lean();

    if (found) {
      let reason = 'Duplicate criteria matched';
      if (candidate.email && found.email === candidate.email.toLowerCase().trim()) reason = `Matched existing email: ${found.email}`;
      else if (candidate.googlePlaceId && found.googlePlaceId === candidate.googlePlaceId) reason = `Matched Google Place ID: ${found.googlePlaceId}`;
      else if (candidate.domain && found.domain === candidate.domain.toLowerCase().trim()) reason = `Matched domain: ${found.domain}`;
      else if (candidate.phone && found.phone === candidate.phone.trim()) reason = `Matched phone: ${found.phone}`;

      return { isDuplicate: true, existingLead: found, reason };
    }
  }

  // 5. Check by normalized Company Name + Address
  if (candidate.company || candidate.companyName) {
    const compName = candidate.companyName || candidate.company;
    const sameCompanyLeads = await Lead.find({
      organizationId,
      $or: [{ company: new RegExp(`^${compName.trim()}$`, 'i') }, { companyName: new RegExp(`^${compName.trim()}$`, 'i') }],
    })
      .select('company companyName address')
      .lean();

    for (const ex of sameCompanyLeads) {
      if (candidate.address && ex.address) {
        const key1 = normalizeCompanyAndAddress(compName, candidate.address);
        const key2 = normalizeCompanyAndAddress(ex.companyName || ex.company, ex.address);
        if (key1 && key2 && key1 === key2) {
          return {
            isDuplicate: true,
            existingLead: ex,
            reason: `Matched company name and address: "${compName}" at "${candidate.address}"`,
          };
        }
      } else if (!candidate.address && !ex.address) {
        return {
          isDuplicate: true,
          existingLead: ex,
          reason: `Matched company name: "${compName}"`,
        };
      }
    }
  }

  return { isDuplicate: false, existingLead: null, reason: null };
}
