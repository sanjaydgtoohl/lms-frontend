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

  const parseId = (val: any): number | string | undefined => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'object') {
      const raw = val.value ?? val.id ?? val;
      return parseId(raw);
    }
    const s = String(val).trim();
    if (/^-?\d+$/.test(s)) return Number(s);
    return s;
  };

  if (form.briefName) payload.brief_name = String(form.briefName);
  if (form.briefId) payload.brief_id = String(form.briefId);
  if (form.brandName) {
    const bid = parseId(form.brandName);
    if (typeof bid === 'number') payload.brand_id = bid;
    else payload.brand = String(bid);
  }
  if (form.productName) payload.product = String(form.productName);
  if (form.contactPerson) {
    const cp = parseId(form.contactPerson);
    if (typeof cp === 'number') payload.contact_person_id = cp;
    else payload.contact_person = String(cp);
  }
  if (form.programmatic) payload.mode_of_campaign = String(form.programmatic).toLowerCase();
  if (form.type) payload.media_type = String(form.type).toLowerCase();
  // Priority mapping: prefer numeric id when label is not provided as id
  const priorityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
  if (form.priority) {
    const pRaw = form.priority;
    const mapped = priorityMap[String(pRaw)];
    if (mapped) payload.priority_id = mapped;
    else {
      const pVal = parseId(pRaw);
      if (typeof pVal === 'number') payload.priority_id = pVal;
      else payload.priority = String(pVal);
    }
  }
  if (form.budget) payload.budget = form.budget;
  if (form.createdBy) {
    const aid = parseId(form.createdBy);
    if (typeof aid === 'number') payload.agency_id = aid;
    else payload.agency = String(aid);
  }
  if (form.assignTo) {
    const asg = parseId(form.assignTo);
    if (typeof asg === 'number') payload.assign_user_id = asg;
    else payload.assign_user = String(asg);
  }
  if (form.status) {
    const sid = parseId(form.status);
    if (typeof sid === 'number') payload.brief_status_id = sid;
    else payload.status = String(sid);
  }
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
