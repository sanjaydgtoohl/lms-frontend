import React, { useState, useEffect } from 'react';
import { fetchDesignations, fetchDepartments, fetchZones, fetchCities, fetchStates, fetchCountries } from '../../../services/CreateLead';
import { Trash2, X as XIcon } from 'lucide-react';
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
}

const ContactPersonsCard: React.FC<ContactPersonsCardProps> = ({ 
  initialContacts,
  onChange
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
    updateContacts(contacts.map(c => c.id === id ? { 
      ...c, 
      [field]: value 
    } : c));
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

  useEffect(() => {
    let isMounted = true;
    setStateLoading(true);
    setStateError(null);
    fetchStates().then(({ data, error }) => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    setCityLoading(true);
    setCityError(null);
    fetchCities().then(({ data, error }) => {
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
  }, []);

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
                      </div>
                      {!c.showSecondMobile && (
                        <button
                          type="button"
                          onClick={() => updateContact(c.id, 'showSecondMobile', true)}
                          className="h-10 w-10 flex items-center justify-center rounded-lg text-white font-medium transition-colors mt-6 hover:bg-blue-700"
                          style={{ backgroundColor: '#ff9500' }}
                          title="Add another mobile number"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
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
                          className="h-10 w-10 flex items-center justify-center rounded-lg text-white font-medium transition-colors duration-200 hover:bg-red-700"
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
                    options={['Option 1', 'Option 2', 'Option 3']}
                    value={c.type}
                    onChange={(v) => updateContact(c.id, 'type', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Designation <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="designation"
                    placeholder="Select designation"
                    options={designationOptions}
                    value={c.designation}
                    onChange={(v) => updateContact(c.id, 'designation', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={designationLoading}
                  />
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
                    onChange={(v) => updateContact(c.id, 'department', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={departmentLoading}
                  />
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
                    onChange={(v) => updateContact(c.id, 'country', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={countryLoading}
                  />
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
                    onChange={(v) => updateContact(c.id, 'state', v)}
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
                    onChange={(v) => updateContact(c.id, 'city', v)}
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
                    onChange={(v) => updateContact(c.id, 'zone', v)}
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
                    placeholder="Select sub-source"
                    options={['Direct', 'Referral', 'Online', 'Event', 'Other']}
                    value={c.subSource}
                    onChange={(v) => updateContact(c.id, 'subSource', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
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
