/**
 * Abstract Base Class / Interface for Lead Discovery Providers
 */
export class LeadProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Search and return normalized leads
   * @param {Object} params
   * @param {string} params.query - Custom search query
   * @param {string} params.industry - Target industry (e.g. Restaurant, Dental)
   * @param {string} params.location - Target city/country (e.g. London, UK)
   * @param {number} params.quantity - Number of leads desired
   * @param {Object} params.filters - Filter specifications
   * @returns {Promise<Array<NormalizedLead>>}
   */
  async searchLeads(params) {
    throw new Error(`searchLeads() must be implemented by ${this.name}`);
  }

  /**
   * Normalize raw provider output to canonical Lead schema
   */
  normalizeLead(raw) {
    throw new Error(`normalizeLead() must be implemented by ${this.name}`);
  }
}
