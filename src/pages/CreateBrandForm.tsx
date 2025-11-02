import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MasterFormHeader } from '../components/ui';
import { listZones, listStates, listCountries, listBrandTypes } from '../services/CreateBrandForm';
import type { Zone, State, Country, BrandType } from '../services/CreateBrandForm';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
};

type CitySelectProps = {
  state: string;
  value: string;
  onChange: (val: string) => void;
};

const CitySelect: React.FC<CitySelectProps> = ({ state, value, onChange }) => {
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
        setCities((data || []).map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch(() => { /* ui store handles show error */ })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [state]);

  return (
    <select
      name="city"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
    >
      <option value="">{loading ? 'Loading cities...' : cities.length ? 'Select City' : 'Select State first'}</option>
      {cities.map((c) => (
        <option key={String(c.id)} value={String(c.id)}>{c.name}</option>
      ))}
    </select>
  );
};

const CreateBrandForm: React.FC<Props> = ({ onClose, onSave }) => {
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
      const res: any = onSave ? (onSave as any)(form) : null;
      if (res && typeof res.then === 'function') {
        await res;
      }
    } catch (err) {
      // parent will handle errors if needed
    }
    onClose();
    window.location.reload();
  };

  useEffect(() => {
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

    return () => { mounted = false; };
  }, []);

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Brand Name <span className="text-red-500">*</span></label>
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
          <select
            name="brandType"
            value={form.brandType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Please Select Brand Type</option>
            {brandTypes.map((type) => (
              <option key={String(type.id)} value={String(type.id)}>{type.name}</option>
            ))}
          </select>
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
          <select
            name="agency"
            value={form.agency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Please Select Agency (optional)</option>
            <option value="Agency 1">Agency 1</option>
            <option value="Agency 2">Agency 2</option>
            <option value="Agency 3">Agency 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Industry <span className="text-red-500">*</span></label>
          <select
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Please Select Industry</option>
            <option value="Industry 1">Industry 1</option>
            <option value="Industry 2">Industry 2</option>
            <option value="Industry 3">Industry 3</option>
          </select>
          {errors.industry && <div className="text-xs text-red-500 mt-1">{errors.industry}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Country <span className="text-red-500">*</span></label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="Please Select Country">Please Select Country</option>
            {countries.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          {errors.country && <div className="text-xs text-red-500 mt-1">{errors.country}</div>}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Postal Code</label>
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Please Enter Postal Code"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">State</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Please Select State</option>
            {states.map((s) => (
              <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">City</label>
          <CitySelect state={form.state} value={form.city} onChange={(val) => setForm(prev => ({ ...prev, city: val }))} />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Zone</label>
          <select
            name="zone"
            value={form.zone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Please Select Zone</option>
            {zones.map((z) => (
              <option key={z.id} value={String(z.id)}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
        >
          Save
        </button>
      </div>
    </form>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader onBack={onClose} title="Create Brand" />
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          {formContent}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBrandForm;