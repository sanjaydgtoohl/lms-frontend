// Thin service wrapper dedicated for the Create Industry form.
// Re-uses the underlying IndustryMaster service to avoid duplication.

export type { Industry } from './IndustryMaster';
export { createIndustry } from './IndustryMaster';

// For dropdowns or validations in the create form
export { listIndustries as fetchIndustries } from './IndustryMaster';


