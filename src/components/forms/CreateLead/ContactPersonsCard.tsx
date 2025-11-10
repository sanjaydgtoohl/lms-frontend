import React, { useState } from 'react';
import { Plus as PlusIcon, Trash2, X as XIcon } from 'lucide-react';
import Input from '../../ui/Input';

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

  const addContact = () => updateContacts([...contacts, emptyContact(String(contacts.length + 1))]);
  
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
    <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-sm px-8 py-7 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-[#344054]">Contact Persons</h3>
        <button
          type="button"
          onClick={addContact}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg btn-primary text-white font-medium shadow-sm transition-colors duration-200"
        >
          <PlusIcon strokeWidth={2.5} className="w-4 h-4" />
          <span className="text-sm">Add Contact</span>
        </button>
      </div>

      {contacts.map((c, idx) => (
        <div key={c.id} className="bg-white border border-[#E3E8EF] rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="text-base font-medium text-[#344054]">Contact Person {idx + 1}</div>
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

          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Enter full name" value={c.fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'fullName', e.target.value)} />
            <Input label="Profile URL" placeholder="Enter profile URL" value={c.profileUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'profileUrl', e.target.value)} />
            <Input label="Email" placeholder="Enter email address" value={c.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'email', e.target.value)} />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input 
                    label="Mobile No." 
                    placeholder="Enter mobile number" 
                    value={c.mobileNo} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'mobileNo', e.target.value)}
                    required
                  />
                </div>
                {!c.showSecondMobile && (
                  <button
                    type="button"
                    onClick={() => updateContact(c.id, 'showSecondMobile', true)}
                    className="h-11 w-11 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors mt-7 border border-blue-200"
                    title="Add another mobile number"
                  >
                    <PlusIcon strokeWidth={2.5} className="w-4 h-4" />
                  </button>
                )}
              </div>
              {c.showSecondMobile && (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder="Enter second mobile number" 
                      value={c.mobileNo2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'mobileNo2', e.target.value)}
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
                    className="h-11 w-11 flex items-center justify-center rounded-lg text-[#D92D20] font-medium transition-colors duration-200"
                    style={{ backgroundColor: '#F5F0F0' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFD7D7'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F5F0F0'}
                  >
                    <XIcon strokeWidth={2.5} className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <Input label="Type" placeholder="Select type" value={c.type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'type', e.target.value)} />
            <Input label="Designation" placeholder="Select designation" value={c.designation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'designation', e.target.value)} />
            <Input label="Agency / Brand" placeholder="Enter agency or brand" value={c.agencyBrand} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'agencyBrand', e.target.value)} />
            <Input label="Sub-Source" placeholder="Select sub-source" value={c.subSource} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'subSource', e.target.value)} />
            <Input label="Department" placeholder="Select department" value={c.department} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'department', e.target.value)} />
            <Input label="Country" placeholder="Select country" value={c.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'country', e.target.value)} />
            <Input label="State" placeholder="Select state" value={c.state} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'state', e.target.value)} />
            <Input label="City" placeholder="Select city" value={c.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'city', e.target.value)} />
            <Input label="Zone" placeholder="Select zone" value={c.zone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'zone', e.target.value)} />
            <Input label="Postal Code" placeholder="Enter postal code" value={c.postalCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(c.id, 'postalCode', e.target.value)} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactPersonsCard;
