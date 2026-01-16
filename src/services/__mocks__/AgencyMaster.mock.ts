// Simple mock data for AgencyMaster service
export const mockAgenciesResponse = {
  data: [
    { id: 1, name: 'Agency One', agency_group: { name: 'Group A' }, agency_type: 'Online', created_at: '2025-11-12T10:00:00Z' },
    { id: 2, name: 'Agency Two', agency_group: { name: 'Group B' }, agency_type: 'Offline', created_at: '2025-11-11T12:00:00Z' },
  ],
  meta: { pagination: { current_page: 1, per_page: 10, total: 2, last_page: 1, from: 1, to: 2 } }
};

export function mockListAgencies(page = 1, perPage = 10) {
  return Promise.resolve(mockAgenciesResponse);
}
