jest.mock('../../constants', () => ({
  API_BASE_URL: 'http://api.test'
}));

import { listAgencies } from '../AgencyMaster';

describe('AgencyMaster service', () => {
  beforeEach(() => {
    // reset fetch mock
    (globalThis as any).fetch = (jest as any).fn();
  });

  afterEach(() => {
    (jest as any).resetAllMocks();
  });

  test('listAgencies returns data and meta', async () => {
    const mockResponse = {
      data: [
        { id: 1, name: 'Agency 1', agency_type: 'Type A' },
        { id: 2, name: 'Agency 2', agency_type: 'Type B' }
      ],
      meta: { pagination: { current_page: 1, per_page: 10, total: 2, last_page: 1, from: 1, to: 2 } }
    };

    (globalThis as any).fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

    const res = await listAgencies(1, 10);
    expect(res.data).toHaveLength(2);
    expect(res.meta).toBeDefined();
    expect(res.meta?.pagination?.total).toBe(2);
  });
});
