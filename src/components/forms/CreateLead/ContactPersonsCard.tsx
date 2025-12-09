import React, { useState, useEffect } from 'react';
import { fetchDesignations, fetchDepartments, fetchZones, fetchCities, fetchStates, fetchCountries } from '../../../services/CreateLead';
import { fetchLeadSubSources } from '../../../services/ContactPersonsCard';
import { Trash2, X as XIcon, Plus } from 'lucide-react';
import SelectField from '../../ui/SelectField';

type Contact = {
  id: string;
  fullName: string;
  profileUrl: string;
  email: string;
  mobileNo: string;
  mobileNo2: string;
  showSecondMobile: boolean;
  type: string;
  designation: string;
  agencyBrand: string;
  subSource: string;
  department: string;
  country: string;
  state: string;
  city: string;
  zone: string;
  postalCode: string;
};

const emptyContact = (id = '1'): Contact => ({
  id,
  fullName: '',
  profileUrl: '',
  email: '',
  mobileNo: '',
  mobileNo2: '',
  showSecondMobile: false,
  type: '',
  designation: '',
  agencyBrand: '',
  subSource: '',
  department: '',
  country: '',
  state: '',
  city: '',
  zone: '',
  postalCode: '',
});

interface ContactPersonsCardProps {
  initialContacts?: Contact[];
  onChange?: (contacts: Contact[]) => void;
  errors?: Record<string, Partial<Record<string, string>>>;
}

const ContactPersonsCard: React.FC<ContactPersonsCardProps> = ({ 
  initialContacts,
  onChange
  , errors
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || [emptyContact('1')]);

  // Designation dropdown state
  const [designationOptions, setDesignationOptions] = useState<{ value: string; label: string }[]>([]);
  const [designationLoading, setDesignationLoading] = useState(false);
  const [designationError, setDesignationError] = useState<string | null>(null);

  // Department dropdown state
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  // Zone dropdown state
  const [zoneOptions, setZoneOptions] = useState<{ value: string; label: string }[]>([]);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [zoneError, setZoneError] = useState<string | null>(null);

  // Sub-source dropdown state
  const [subSourceOptions, setSubSourceOptions] = useState<{ value: string; label: string }[]>([]);
  const [subSourceLoading, setSubSourceLoading] = useState(false);
  const [subSourceError, setSubSourceError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setSubSourceLoading(true);
    setSubSourceError(null);
    fetchLeadSubSources().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setSubSourceError(error);
        setSubSourceOptions([]);
      } else {
        setSubSourceOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setSubSourceLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setDesignationLoading(true);
    setDesignationError(null);
    fetchDesignations().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setDesignationError(error);
        setDesignationOptions([]);
      } else {
        setDesignationOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setDesignationLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setDepartmentLoading(true);
    setDepartmentError(null);
    fetchDepartments().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setDepartmentError(error);
        setDepartmentOptions([]);
      } else {
        setDepartmentOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setDepartmentLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setZoneLoading(true);
    setZoneError(null);
    fetchZones().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setZoneError(error);
        setZoneOptions([]);
      } else {
        setZoneOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setZoneLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const updateContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    onChange?.(newContacts);
  };

  const removeContact = (id: string) => {
    updateContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id: string, field: keyof Contact, value: string | boolean) => {
    updateContacts(contacts.map(c => {
      const updated = { ...c, [field]: value };
      // Clear state when country changes
      if (field === 'country' && value !== c.country) {
        updated.state = '';
        updated.city = '';
      }
      // Clear city when state changes
      if (field === 'state' && value !== c.state) {
        updated.city = '';
      }
      return c.id === id ? updated : c;
    }));
  };

  // Country dropdown state
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);

  // State dropdown state
  const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  // City dropdown state
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    setCountryLoading(true);
    setCountryError(null);
    fetchCountries().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setCountryError(error);
        setCountryOptions([]);
      } else {
        setCountryOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setCountryLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch states when any contact's country changes
  useEffect(() => {
    let isMounted = true;
    
    // Check if any contact has a country selected
    const selectedCountry = contacts.find(c => c.country)?.country;
    
    if (!selectedCountry) {
      setStateOptions([]);
      setStateError(null);
      return;
    }
    
    setStateLoading(true);
    setStateError(null);
    fetchStates({ country_id: selectedCountry }).then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setStateError(error);
        setStateOptions([]);
      } else {
        setStateOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setStateLoading(false);
    });
    return () => { isMounted = false; };
  }, [contacts]);

  // Helper: lookup PIN code using api.postalpincode.in
  const lookupPinCode = async (pin: string): Promise<{ countryName: string; stateName: string; cityName: string } | null> => {
    try {
      const resp = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (!resp.ok) return null;
      const json = await resp.json();
      if (!Array.isArray(json) || json.length === 0) return null;
      const first = json[0];
      if (first.Status !== 'Success' || !Array.isArray(first.PostOffice) || first.PostOffice.length === 0) return null;
      const po = first.PostOffice[0];
      return {
        countryName: po.Country || '',
        stateName: po.State || '',
        cityName: po.District || po.Block || po.Name || '',
      };
    } catch (e) {
      return null;
    }
  };

  // Track last looked-up PIN to avoid setState during render
  const [lastPinLookup, setLastPinLookup] = useState<string>('');
  useEffect(() => {
    const contact = contacts.find(c => c.id);
    if (!contact || !contact.postalCode) return;

    const pin = contact.postalCode.trim();
    if (!/^\d{6}$/.test(pin)) return;
    if (pin === lastPinLookup) return;

    setLastPinLookup(pin);

    (async () => {
      try {
        const pinRes = await lookupPinCode(pin);
        if (!pinRes) return;

        const { countryName, stateName, cityName } = pinRes;

        // Try to map country name to an existing option value
        const countryOpt = countryOptions.find(o => o.label.toLowerCase() === countryName.toLowerCase());
        if (countryOpt) {
          // Update country asynchronously
          setContacts(prev => {
            const next = prev.map(c => c.id === contact.id ? { ...c, country: countryOpt.value } : c);
            onChange?.(next);
            return next;
          });

          // Fetch states for this country and try to map by name
          const { data: statesData } = await fetchStates({ country_id: countryOpt.value });
          if (Array.isArray(statesData)) {
            const matchedState = statesData.find((s: any) => String(s.name).toLowerCase() === String(stateName).toLowerCase());
            if (matchedState) {
              const stateId = String(matchedState.id);
              setContacts(prev => {
                const next = prev.map(c => c.id === contact.id ? { ...c, state: stateId } : c);
                onChange?.(next);
                return next;
              });

              // Fetch cities for matched state and try to map by name
              const { data: citiesData } = await fetchCities({ state_id: stateId });
              if (Array.isArray(citiesData)) {
                const matchedCity = citiesData.find((ct: any) => {
                  const nm = String(ct.name || '').toLowerCase();
                  const districtField = String(ct.district || ct.District || '').toLowerCase();
                  const cityField = String(ct.city || '').toLowerCase();
                  const target = String(cityName || '').toLowerCase();
                  return nm === target || districtField === target || cityField === target;
                });
                if (matchedCity) {
                  const cityId = String(matchedCity.id);
                  setContacts(prev => {
                    const next = prev.map(c => c.id === contact.id ? { ...c, city: cityId } : c);
                    onChange?.(next);
                    return next;
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        // ignore lookup errors silently
      }
    })();
  }, [contacts, countryOptions, lastPinLookup]);

  // Fetch cities when any contact's state changes
  useEffect(() => {
    let isMounted = true;
    
    // Check if any contact has a state selected
    const selectedState = contacts.find(c => c.state)?.state;
    
    if (!selectedState) {
      setCityOptions([]);
      setCityError(null);
      return;
    }
    
    setCityLoading(true);
    setCityError(null);
    fetchCities({ state_id: selectedState }).then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setCityError(error);
        setCityOptions([]);
      } else {
        setCityOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setCityLoading(false);
    });
    return () => { isMounted = false; };
  }, [contacts]);

  return (
    <div className="space-y-6 mb-6">
      {contacts.map((c) => (
        <div key={c.id} className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
          <div className="p-6 bg-[#F9FAFB]">
            <div className="flex items-center justify-between mb-6">
              <div className="text-base font-semibold text-[#344054]">Contact Person</div>
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(c.id)}
                  className="text-sm px-4 py-2 rounded-lg bg-[#F5F0F0] text-[#D92D20] font-medium flex items-center justify-center hover:bg-[#FFD7D7] transition-colors duration-200"
                  style={{ backgroundColor: '#F5F0F0' }}
                >
                  <Trash2 strokeWidth={2.5} className="w-4 h-4 mr-1" /> Delete
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Row 1: Full Name, Profile URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Full Name <span className="text-[#FF0000]">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={c.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'fullName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors?.[c.id]?.fullName && (
                    <div className="text-xs text-red-500 mt-1">{errors[c.id].fullName}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Profile URL</label>
                  <input
                    type="text"
                    placeholder="Enter profile URL"
                    value={c.profileUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'profileUrl', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Email, Mobile No. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={c.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Mobile No. <span className="text-[#FF0000]">*</span></label>
                        <input
                          type="tel"
                          placeholder="Enter mobile number"
                          value={c.mobileNo}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'mobileNo', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                        {errors?.[c.id]?.mobileNo && (
                          <div className="text-xs text-red-500 mt-1">{errors[c.id].mobileNo}</div>
                        )}
                      </div>
                      {!c.showSecondMobile && (
                        <button
                          type="button"
                          onClick={() => updateContact(c.id, 'showSecondMobile', true)}
                          className="px-3 py-2 flex items-center justify-center rounded-lg text-white font-medium transition-colors mt-6 hover:bg-orange-600 text-sm gap-1"
                          style={{ backgroundColor: '#ff9500' }}
                          title="Add another mobile number"
                        >
                          <Plus strokeWidth={2.5} className="w-4 h-4" />
                         
                        </button>
                      )}
                    </div>
                    {c.showSecondMobile && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="tel"
                            placeholder="Enter second mobile number"
                            value={c.mobileNo2}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'mobileNo2', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedContact = {
                              ...c,
                              showSecondMobile: false,
                              mobileNo2: ''
                            };
                            updateContacts(contacts.map(contact =>
                              contact.id === c.id ? updatedContact : contact
                            ));
                          }}
                          className="px-3 py-2 flex items-center justify-center rounded-lg text-white font-medium transition-colors duration-200 hover:bg-red-700 text-sm gap-1"
                          style={{ backgroundColor: '#D92D20' }}
                        >
                          <XIcon strokeWidth={2.5} className="w-4 h-4" />
                       
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Type, Designation, Department */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Type <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="type"
                    placeholder="Select type"
                    options={[{ value: 'Brand', label: 'Brand' }, { value: 'Agency', label: 'Agency' }]}
                    value={c.type}
                    onChange={(v) => updateContact(c.id, 'type', typeof v === 'string' ? v : v[0] ?? '')}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                  {errors?.[c.id]?.type && <div className="text-xs text-red-500 mt-1">{errors[c.id].type}</div>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Designation <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="designation"
                    placeholder="Select designation"
                    options={designationOptions}
                    value={c.designation}
                    onChange={(v) => updateContact(c.id, 'designation', typeof v === 'string' ? v : v[0] ?? '')}      
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={designationLoading}
                  />
                  {errors?.[c.id]?.designation && <div className="text-xs text-red-500 mt-1">{errors[c.id].designation}</div>}
                  {designationLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {designationError && <div className="text-xs text-red-500 mt-1">{designationError}</div>}
                  {!designationLoading && !designationError && designationOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No designations found.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Department <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="department"
                    placeholder="Select department"
                    options={departmentOptions}
                    value={c.department}
                    onChange={(v) => updateContact(c.id, 'department', typeof v === 'string' ? v : v[0] ?? '')}       
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={departmentLoading}
                  />
                  {errors?.[c.id]?.department && <div className="text-xs text-red-500 mt-1">{errors[c.id].department}</div>}
                  {departmentLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {departmentError && <div className="text-xs text-red-500 mt-1">{departmentError}</div>}
                  {!departmentLoading && !departmentError && departmentOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No departments found.</div>
                  )}
                </div>
              </div>

              {/* Row 4: Country, State, City */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Country <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="country"
                    placeholder="Select country"
                    options={countryOptions}
                    value={c.country}
                    onChange={(v) => updateContact(c.id, 'country', typeof v === 'string' ? v : v[0] ?? '')}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={countryLoading}
                  />
                  {errors?.[c.id]?.country && <div className="text-xs text-red-500 mt-1">{errors[c.id].country}</div>}
                  {countryLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {countryError && <div className="text-xs text-red-500 mt-1">{countryError}</div>}
                  {!countryLoading && !countryError && countryOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No countries found.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">State</label>
                  <SelectField
                    name="state"
                    placeholder="Select state"
                    options={stateOptions}
                    value={c.state}
                    onChange={(v) => updateContact(c.id, 'state', typeof v === 'string' ? v : v[0] ?? '')}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={stateLoading}
                  />
                  {stateLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {stateError && <div className="text-xs text-red-500 mt-1">{stateError}</div>}
                  {!stateLoading && !stateError && stateOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No states found.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">City</label>
                  <SelectField
                    name="city"
                    placeholder="Select city"
                    options={cityOptions}
                    value={c.city}
                    onChange={(v) => updateContact(c.id, 'city', typeof v === 'string' ? v : v[0] ?? '')}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={cityLoading}
                  />
                  {cityLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {cityError && <div className="text-xs text-red-500 mt-1">{cityError}</div>}
                  {!cityLoading && !cityError && cityOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No cities found.</div>
                  )}
                </div>
              </div>

              {/* Row 5: Zone, Sub-Source, Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Zone</label>
                  <SelectField
                    name="zone"
                    placeholder="Select zone"
                    options={zoneOptions}
                    value={c.zone}
                    onChange={(v) => updateContact(c.id, 'zone', typeof v === 'string' ? v : v[0] ?? '')}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={zoneLoading}
                  />
                  {zoneLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {zoneError && <div className="text-xs text-red-500 mt-1">{zoneError}</div>}
                  {!zoneLoading && !zoneError && zoneOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No zones found.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Sub-Source <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="subSource"
                    placeholder={subSourceLoading ? "Loading..." : "Select sub-source"}
                    options={subSourceOptions}
                    value={c.subSource}
                    onChange={(v) => {
                      // v can be string or string[] depending on SelectField implementation
                      if (typeof v === 'string') {
                        updateContact(c.id, 'subSource', v);
                      } else if (Array.isArray(v) && v.length > 0) {
                        // Use the first value in the array
                        updateContact(c.id, 'subSource', v[0]);
                      } else {
                        updateContact(c.id, 'subSource', '');
                      }
                    }}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={subSourceLoading}
                  />
                  {errors?.[c.id]?.subSource && <div className="text-xs text-red-500 mt-1">{errors[c.id].subSource}</div>}
                  {subSourceLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
                  {subSourceError && <div className="text-xs text-red-500 mt-1">{subSourceError}</div>}
                  {!subSourceLoading && !subSourceError && subSourceOptions.length === 0 && (
                    <div className="text-xs text-gray-400 mt-1">No sub-sources found.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Postal Code</label>
                  <input
                    type="text"
                    placeholder="Enter postal code"
                    value={c.postalCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'postalCode', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactPersonsCard;
