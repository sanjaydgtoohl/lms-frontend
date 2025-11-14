import React, { useState } from 'react';
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
                          style={{ backgroundColor: '#4285F4' }}
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
                    options={['Manager', 'Senior Manager', 'Executive', 'Director', 'VP']}
                    value={c.designation}
                    onChange={(v) => updateContact(c.id, 'designation', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Department <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="department"
                    placeholder="Select department"
                    options={['Marketing', 'Sales', 'Finance', 'Operations', 'HR']}
                    value={c.department}
                    onChange={(v) => updateContact(c.id, 'department', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Country, State, City */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Country <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="country"
                    placeholder="Select country"
                    options={['India', 'USA', 'UK', 'Canada', 'Australia']}
                    value={c.country}
                    onChange={(v) => updateContact(c.id, 'country', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">State</label>
                  <SelectField
                    name="state"
                    placeholder="Select state"
                    options={['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune']}
                    value={c.state}
                    onChange={(v) => updateContact(c.id, 'state', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">City</label>
                  <SelectField
                    name="city"
                    placeholder="Select city"
                    options={['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune']}
                    value={c.city}
                    onChange={(v) => updateContact(c.id, 'city', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Zone, Sub-Source, Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Zone</label>
                  <SelectField
                    name="zone"
                    placeholder="Select zone"
                    options={['North', 'South', 'East', 'West', 'Central']}
                    value={c.zone}
                    onChange={(v) => updateContact(c.id, 'zone', v)}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
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
