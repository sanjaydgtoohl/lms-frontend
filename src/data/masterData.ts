// Lightweight in-memory sample data for master modules.
// Used by MasterViewPage/MasterEditPage to show realistic data when viewing/editing via route.

export type GenericItem = Record<string, any> & { id: string };

const brands: GenericItem[] = [
  { id: '#CMPR01', name: 'Nike', agencyName: 'Agency 1', brandType: 'National', city: 'Pune' },
  { id: '#CMPR02', name: 'Puma', agencyName: 'Agency 1', brandType: 'Local', city: 'Pune' },
];

const agencies: GenericItem[] = [
  { id: '#CMPR01', agencyGroup: 'Group 1', agencyName: 'Agency 1', agencyType: 'Offline' },
  { id: '#CMPR02', agencyGroup: 'Group 2', agencyName: 'Agency 2', agencyType: 'Online' },
];

const departments: GenericItem[] = [
  { id: '#CMPR01', name: 'Department 1' },
  { id: '#CMPR02', name: 'Department 2' },
];

const designations: GenericItem[] = [
  { id: '#CMP801', name: 'Designation 1' },
  { id: '#CMP802', name: 'Software Engineer' },
];

const industries: GenericItem[] = [
  { id: '#CMP801', name: 'Industry 1' },
  { id: '#CMP802', name: 'Technology' },
];

const leadSources: GenericItem[] = [
  { id: 'LS001', source: 'Website', subSource: 'Contact Form' },
  { id: 'LS002', source: 'Social Media', subSource: 'LinkedIn' },
];

export function getItem(moduleName: string, id: string): GenericItem | null {
  const m = (moduleName || '').toLowerCase();
  switch (m) {
    case 'brand':
      return brands.find(b => b.id === id) ?? null;
    case 'agency':
      return agencies.find(a => a.id === id) ?? null;
    case 'department':
      return departments.find(d => d.id === id) ?? null;
    case 'designation':
      return designations.find(d => d.id === id) ?? null;
    case 'industry':
      return industries.find(i => i.id === id) ?? null;
    case 'lead-source':
    case 'source':
    case 'leadsource':
      return leadSources.find(ls => ls.id === id) ?? null;
    default:
      return null;
  }
}
