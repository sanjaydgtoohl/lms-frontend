import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MasterFormHeader, SelectField } from '../components/ui';
import { listZones, listStates, listCountries, listBrandTypes } from '../services/CreateBrandForm';
import type { Zone, State, Country, BrandType } from '../services/CreateBrandForm';
import { fetchIndustries } from '../services/CreateIndustryForm';
import type { Industry } from '../services/CreateIndustryForm';
import { showSuccess, showError } from '../utils/notifications';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
};

type CitySelectProps = {
  state: string;
  value: string;
  onChange: (val: string) => void;
  // optional: when parent has a preselected city name (from postal API) that may not exist
  // in the fetched list, provide it so the select can show it as an option.
  preselectedCityName?: string;
};

const CitySelect: React.FC<CitySelectProps> = ({ state, value, onChange, preselectedCityName }) => {
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const numericState = state && String(state).match(/^\d+$/) ? Number(state) : undefined;

    import('../services/CreateBrandForm')
      .then((mod) => {
        return mod.listCities(numericState ? { state_id: numericState } : undefined);
      })
      .then((data) => {
        if (!mounted) return;
        const normalized = (data || []).map((c: any) => ({ id: c.id, name: c.name }));
        // If parent provided a preselected city name that's not in the list, inject it so it appears
        if (preselectedCityName) {
          const pre = String(preselectedCityName || '').trim();
          if (pre) {
            const exists = normalized.find((it: any) => String(it.name).toLowerCase() === pre.toLowerCase());
            if (!exists) normalized.unshift({ id: pre, name: pre });
          }
        }
        setCities(normalized);
      })
      .catch(() => { /* ui store handles show error */ })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [state]);

  return (
    <div>
      <SelectField
        name="city"
        value={value}
        onChange={(v) => onChange(v)}
        options={cities.map(c => ({ value: String(c.id), label: c.name }))}
        placeholder={loading ? 'Loading cities...' : (cities.length ? 'Select City' : 'Select State first')}
        disabled={loading}
      />
    </div>
  );
};

const CreateBrandForm: React.FC<Props> = ({ onClose, onSave, initialData, mode = 'create' }) => {
  const [form, setForm] = useState({
    brandName: '',
    brandType: '',
    website: '',
    agency: '',
    industry: '',
    country: 'Please Select Country',
    postalCode: '',
    state: '',
    city: '',
    zone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zones, setZones] = useState<Zone[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [brandTypes, setBrandTypes] = useState<BrandType[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.brandName.trim()) next.brandName = 'Brand Name Is Required';
    if (!form.brandType) next.brandType = 'Brand Type Is Required';
    if (!form.industry) next.industry = 'Please Select An Industry';
    if (!form.country || form.country === 'Please Select Country') next.country = 'Please Select A Country';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = { ...form } as Record<string, any>;
      // preserve id when editing if present on initialData
      if (initialData && initialData.id) payload.id = initialData.id;
      const res: any = onSave ? (onSave as any)(payload) : null;
      if (res && typeof res.then === 'function') {
        await res;
      }
      showSuccess(initialData ? 'Brand updated successfully' : 'Brand created successfully');
      onClose();
    } catch (err: any) {
      showError(err?.message || 'Failed to save brand');
    }
  };

  // Lookup postal pincode and auto-fill country/state/city when possible
  const lookupPostalCode = async (pincode: string) => {
    const code = String(pincode || '').trim();
    if (!/^[0-9]{6}$/.test(code)) {
      setPostalError('Please enter a valid 6-digit pincode');
      return;
    }
    setPostalError('');
    setPostalLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(code)}`);
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) throw new Error('Invalid response from postal API');
      const first = arr[0] || {};
      if (first.Status !== 'Success' || !first.PostOffice || !first.PostOffice.length) {
        throw new Error(first.Message || 'No data found for this pincode');
      }
      const po = first.PostOffice[0];
      const countryName = po.Country || '';
      const stateName = po.State || '';
      const districtOrName = po.District || po.Name || '';

      // Map or inject Country
      let countryId: string = '';
      const foundCountry = countries.find(c => String(c.name).toLowerCase() === String(countryName).toLowerCase());
      if (foundCountry) {
        countryId = String(foundCountry.id);
      } else if (countryName) {
        // inject a temporary country option so it appears in the select
        const newC = { id: countryName, name: countryName } as Country;
        setCountries(prev => [newC, ...prev]);
        countryId = countryName;
      }

      // Map or inject State
      let stateId: string = '';
      const foundState = states.find(s => String(s.name).toLowerCase() === String(stateName).toLowerCase());
      if (foundState) {
        stateId = String(foundState.id);
      } else if (stateName) {
        const newS = { id: stateName, name: stateName, country_id: countryId } as any as State;
        setStates(prev => [newS, ...prev]);
        stateId = stateName;
      }

      // Try to map City by fetching cities for the state (if any)
      try {
        const citiesList = await import('../services/CreateBrandForm').then(m => m.listCities(stateId ? { state_id: stateId } : undefined));
        const matched = (citiesList || []).find((c: any) => {
          const nm = String(c.name || '').toLowerCase();
          return nm === String(districtOrName).toLowerCase() || nm === String(po.Name || '').toLowerCase();
        });
        if (matched) {
          // set country/state/city using mapped ids
          setForm(prev => ({ ...prev, country: countryId || prev.country, state: stateId || prev.state, city: String(matched.id), postalCode: code }));
        } else {
          // no matching city found — set form values and let CitySelect show the preselected city name
          setForm(prev => ({ ...prev, country: countryId || prev.country, state: stateId || prev.state, city: districtOrName, postalCode: code }));
        }
      } catch (e) {
        // If city lookup fails, still set country/state
        setForm(prev => ({ ...prev, country: countryId || prev.country, state: stateId || prev.state, postalCode: code }));
      }

      setPostalError('');
    } catch (err: any) {
      setPostalError(err?.message || 'Failed to fetch pincode data');
    } finally {
      setPostalLoading(false);
    }
  };

  useEffect(() => {
    // If initialData provided (edit mode) prefill the form
    if (initialData) {
      setForm(prev => ({
        ...prev,
        brandName: initialData.brandName ?? initialData.name ?? prev.brandName,
        brandType: initialData.brandType ?? String(initialData.brandType ?? '') ?? prev.brandType,
        website: initialData.website ?? prev.website,
        agency: initialData.agency ?? initialData.agencyName ?? prev.agency,
        industry: initialData.industry ?? prev.industry,
        country: initialData.country ?? prev.country,
        postalCode: initialData.postalCode ?? initialData.pinCode ?? prev.postalCode,
        state: initialData.state ?? prev.state,
        city: initialData.city ?? prev.city,
        zone: initialData.zone ?? prev.zone,
      }));
    }

    let mounted = true;
    Promise.all([
      listZones(),
      listStates(),
      listCountries(),
      listBrandTypes()
    ]).then(([zonesData, statesData, countriesData, brandTypesData]) => {
      if (!mounted) return;
      setZones(zonesData || []);
      setStates(statesData || []);
      setCountries(countriesData || []);
      setBrandTypes(brandTypesData || []);
    }).catch(() => {
      // Errors are handled by UI store
    });

    // Fetch industries for the Industry dropdown. Request many per page to get a full list.
    fetchIndustries(1, 1000).then((resp) => {
      if (!mounted) return;
      setIndustries((resp && resp.data) ? resp.data : []);
    }).catch(() => {
      // UI store handles showing errors
    });

    return () => { mounted = false; };
  }, []);

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Brand Name <span className="text-[#FF0000]">*</span></label>
          <input
            name="brandName"
            value={form.brandName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Please Enter Brand Name"
          />
          {errors.brandName && <div className="text-xs text-red-500 mt-1">{errors.brandName}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Brand Type <span className="text-red-500">*</span></label>
          <div>
            <SelectField
              name="brandType"
              value={form.brandType}
              onChange={(v) => setForm(prev => ({ ...prev, brandType: v }))}
              options={brandTypes.map(t => ({ value: String(t.id), label: t.name }))}
              placeholder="Search or select option"
            />
          </div>
          {errors.brandType && <div className="text-xs text-red-500 mt-1">{errors.brandType}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Website</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="https://"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Select Existing Agency</label>
          <div>
            <SelectField
              name="agency"
              value={form.agency}
              onChange={(v) => setForm(prev => ({ ...prev, agency: v }))}
              options={[ 'Agency 1', 'Agency 2', 'Agency 3' ]}
              placeholder="Search or select option"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Industry <span className="text-[#FF0000]">*</span></label>
          <div>
            <SelectField
              name="industry"
              value={form.industry}
              onChange={(v) => setForm(prev => ({ ...prev, industry: v }))}
              options={industries.length ? industries.map(it => ({ value: String(it.id), label: it.name })) : []}
              placeholder={industries.length ? 'Search or select option' : 'No industries available'}
            />
          </div>
          {errors.industry && <div className="text-xs text-red-500 mt-1">{errors.industry}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Country <span className="text-[#FF0000]">*</span></label>
          <div>
            <SelectField
              name="country"
              value={form.country}
              onChange={(v) => setForm(prev => ({ ...prev, country: v }))}
              options={countries.map(c => ({ value: String(c.id), label: c.name }))}
              placeholder="Search or select option"
            />
          </div>
          {errors.country && <div className="text-xs text-red-500 mt-1">{errors.country}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Postal Code</label>
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={(e) => {
              // preserve existing handler behavior
              handleChange(e as any);
              const raw = String(e.target.value || '').replace(/\D/g, '');
              if (raw.length === 6) lookupPostalCode(raw);
            }}
            onBlur={() => {
              const raw = String(form.postalCode || '').trim();
              if (/^[0-9]{6}$/.test(raw)) lookupPostalCode(raw);
            }}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Please Enter Postal Code"
          />
          {postalLoading && <div className="text-xs text-gray-500 mt-1">Looking up pincode...</div>}
          {!postalLoading && postalError && <div className="text-xs text-red-500 mt-1">{postalError}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">State</label>
          <div>
            <SelectField
              name="state"
              value={form.state}
              onChange={(v) => setForm(prev => ({ ...prev, state: v }))}
              options={states.map(s => ({ value: String(s.id), label: s.name }))}
              placeholder="Search or select option"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">City</label>
          <CitySelect state={form.state} value={form.city} preselectedCityName={form.city} onChange={(val) => setForm(prev => ({ ...prev, city: val }))} />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Zone</label>
          <div>
            <SelectField
              name="zone"
              value={form.zone}
              onChange={(v) => setForm(prev => ({ ...prev, zone: v }))}
              options={zones.map(z => ({ value: String(z.id), label: z.name }))}
              placeholder="Search or select option"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg btn-primary text-white shadow-sm"
        >
          {mode === 'edit' ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader onBack={onClose} title={mode === 'edit' ? 'Edit Brand' : 'Create Brand'} />
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          {formContent}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBrandForm;