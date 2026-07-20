import type { AllLeadtype } from '../types/lead/lead.types';

export type LeadBriefPrefillSource = AllLeadtype & {
  brandId?: string;
  agencyId?: string;
  leadNumericId?: string;
};

/** Maps a lead row to CreateBriefForm initialData (contact person, brand, agency). */
export function buildBriefInitialDataFromLead(lead: LeadBriefPrefillSource): Record<string, unknown> {
  const leadId = String(lead.leadNumericId ?? lead.id ?? '').replace(/^#/, '');
  const brandId = String(lead.brandId ?? '').trim();
  const agencyId = String(lead.agencyId ?? '').trim();

  return {
    lead_id: leadId || undefined,
    contact_person_id: leadId || undefined,
    contactPerson: leadId || lead.contactPerson,
    contact_person: lead.contactPerson,
    brand_id: brandId || undefined,
    brandName: brandId || lead.brandName,
    agency_id: agencyId || undefined,
    createdBy: agencyId || undefined,
    agency: agencyId
      ? { id: agencyId, name: lead.agencyName }
      : lead.agencyName
        ? { name: lead.agencyName }
        : undefined,
  };
}

export type BriefCreateLocationState = {
  leadBriefPrefill?: Record<string, unknown>;
};
