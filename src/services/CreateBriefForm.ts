import { createBrief } from './BriefPipeline';
import type { BriefItem } from './BriefPipeline';

/**
 * Map UI form data (camelCase) to API payload (snake_case-ish) expected by backend.
 * This mapping is conservative: it prefers sending readable string values where
 * numeric ids are unknown. If your backend expects numeric ids, replace the
 * mappings accordingly before calling `submitCreateBrief`.
 */
export function mapFormToApiPayload(form: Record<string, any>) {
  const payload: Record<string, any> = {};

  if (form.briefName) payload.brief_name = String(form.briefName);
  if (form.briefId) payload.brief_id = String(form.briefId);
  if (form.brandName) {
    // prefer sending explicit brand id when available
    payload.brand_id = String(form.brandName);
    // also include brand name for backward compatibility when UI sends a name
    payload.brand = String(form.brandName);
  }
  if (form.productName) payload.product = String(form.productName);
  if (form.contactPerson) payload.contact_person = String(form.contactPerson);
  // Backend validation expects `contact_person_id`; prefer sending the id when available.
  if (form.contactPerson) payload.contact_person_id = String(form.contactPerson);
  if (form.programmatic) payload.mode_of_campaign = String(form.programmatic).toLowerCase();
  if (form.type) payload.media_type = String(form.type).toLowerCase();
  if (form.priority) payload.priority = String(form.priority);
  if (form.budget) payload.budget = form.budget;
  if (form.createdBy) payload.agency_id = String(form.createdBy);
  if (form.assignTo) payload.assign_user_id = String(form.assignTo);
  if (form.status) payload.status = String(form.status);
  if (form.briefDetail) payload.comment = String(form.briefDetail);

  // combine submission date + time if provided separately
  if (form.submissionDate && form.submissionTime) {
    // Try to build a sensible ISO-like datetime: YYYY-MM-DD HH:mm:ss
    // If the incoming date is already in a usable format, send as-is.
    const datePart = String(form.submissionDate).trim();
    const timePart = String(form.submissionTime).trim();
    payload.submission_date = `${datePart} ${timePart}`;
  } else if (form.submissionDate) {
    payload.submission_date = String(form.submissionDate);
  }

  return payload;
}

/**
 * Submit a brief using existing `createBrief` service. Returns the created item.
 */
export async function submitCreateBrief(form: Record<string, any>): Promise<BriefItem> {
  const payload = mapFormToApiPayload(form);
  return await createBrief(payload as Partial<BriefItem>);
}

export default {
  mapFormToApiPayload,
  submitCreateBrief,
};
