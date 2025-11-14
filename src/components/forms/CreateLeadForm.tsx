import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Input from '../ui/Input';
import { SelectField } from '../ui';

interface ContactPerson {
  id: string;
  fullName: string;
  email: string;
  type: string;
  department: string;
  country: string;
  state: string;
  zone: string;
  profileUrl: string;
  mobileNo: string;
  designation: string;
  subSource: string;
  postalCode: string;
  city: string;
}

interface CreateLeadFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const CreateLeadForm: React.FC<CreateLeadFormProps> = ({ onSubmit, loading = false }) => {
  const [selectedOption, setSelectedOption] = useState<'brand' | 'agency' | 'both'>('brand');
  const [brand, setBrand] = useState('');
  const [agencySel, setAgencySel] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [priority, setPriority] = useState('');
  const [contacts, setContacts] = useState<ContactPerson[]>([{
    id: '1',
    fullName: '',
    email: '',
    type: '',
    department: '',
    country: '',
    state: '',
    zone: '',
    profileUrl: '',
    mobileNo: '',
    designation: '',
    subSource: '',
    postalCode: '',
    city: ''
  }]);

  const handleAddContact = () => {
    setContacts(prev => [...prev, {
      id: String(prev.length + 1),
      fullName: '',
      email: '',
      type: '',
      department: '',
      country: '',
      state: '',
      zone: '',
      profileUrl: '',
      mobileNo: '',
      designation: '',
      subSource: '',
      postalCode: '',
      city: ''
    }]);
  };

  const handleRemoveContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(prev => prev.filter(contact => contact.id !== id));
    }
  };

  const handleContactChange = (id: string, field: keyof ContactPerson, value: string) => {
    setContacts(prev =>
      prev.map(contact => (contact.id === id ? { ...contact, [field]: value } : contact))
    );
  };

  const handleContactInputChange =
    (id: string, field: keyof ContactPerson) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleContactChange(id, field, event.target.value);
    };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ contacts }); }}>
      {/* Lead Management Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Lead Management</h3>
        <div className="flex items-center gap-6 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'brand'}
              onChange={() => setSelectedOption('brand')}
              className="form-radio h-4 w-4 text-blue-500"
            />
            <span className="ml-2 text-sm text-[var(--text-primary)]">Select Existing Brand</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'agency'}
              onChange={() => setSelectedOption('agency')}
              className="form-radio h-4 w-4 text-blue-500"
            />
            <span className="ml-2 text-sm text-[var(--text-primary)]">Select Existing Agency</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'both'}
              onChange={() => setSelectedOption('both')}
              className="form-radio h-4 w-4 text-blue-500"
            />
            <span className="ml-2 text-sm text-[var(--text-primary)]">Select Existing Brand + Agency</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {(selectedOption === 'brand' || selectedOption === 'both') && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Select Brand
              </label>
              <SelectField
                name="selectBrand"
                value={brand}
                onChange={(v) => setBrand(v)}
                options={[]}
                placeholder="Search or select option"
              />
            </div>
          )}
          {(selectedOption === 'agency' || selectedOption === 'both') && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Select Agency
              </label>
              <SelectField
                name="selectAgency"
                value={agencySel}
                onChange={(v) => setAgencySel(v)}
                options={[]}
                placeholder="Search or select option"
              />
            </div>
          )}
        </div>
      </div>

      {/* Contact Persons Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Contact Persons</h3>
          <button
            type="button"
            onClick={handleAddContact}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        {contacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-2xl border border-[var(--border-color)] p-6 mb-4">
            <div className="flex justify-end mb-4">
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={contact.fullName}
                onChange={handleContactInputChange(contact.id, 'fullName')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={contact.email}
                onChange={handleContactInputChange(contact.id, 'email')}
              />
              <Input
                label="Type"
                placeholder="Select type"
                value={contact.type}
                onChange={handleContactInputChange(contact.id, 'type')}
              />
              <Input
                label="Department"
                placeholder="Select department"
                value={contact.department}
                onChange={handleContactInputChange(contact.id, 'department')}
              />
              <Input
                label="Country"
                placeholder="Select country"
                value={contact.country}
                onChange={handleContactInputChange(contact.id, 'country')}
              />
              <Input
                label="State"
                placeholder="Select state"
                value={contact.state}
                onChange={handleContactInputChange(contact.id, 'state')}
              />
              <Input
                label="Zone"
                placeholder="Select zone"
                value={contact.zone}
                onChange={handleContactInputChange(contact.id, 'zone')}
              />
              <Input
                label="Profile URL"
                placeholder="Enter profile URL"
                value={contact.profileUrl}
                onChange={handleContactInputChange(contact.id, 'profileUrl')}
              />
              <Input
                label="Mobile No."
                placeholder="Enter mobile number"
                value={contact.mobileNo}
                onChange={handleContactInputChange(contact.id, 'mobileNo')}
              />
              <Input
                label="Designation"
                placeholder="Select designation"
                value={contact.designation}
                onChange={handleContactInputChange(contact.id, 'designation')}
              />
              <Input
                label="Sub-Source"
                placeholder="Select sub-source"
                value={contact.subSource}
                onChange={handleContactInputChange(contact.id, 'subSource')}
              />
              <Input
                label="Postal Code"
                placeholder="Enter postal code"
                value={contact.postalCode}
                onChange={handleContactInputChange(contact.id, 'postalCode')}
              />
              <Input
                label="City"
                placeholder="Select city"
                value={contact.city}
                onChange={handleContactInputChange(contact.id, 'city')}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Assign To + Priority Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Assign To
            </label>
            <SelectField
              name="assignTo"
              value={assignTo}
              onChange={(v) => setAssignTo(v)}
              options={[]}
              placeholder="Search or select option"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Priority
            </label>
            <SelectField
              name="priority"
              value={priority}
              onChange={(v) => setPriority(v)}
              options={[ 'High', 'Medium', 'Low' ]}
              placeholder="Search or select option"
            />
          </div>
        </div>
      </div>

      {/* Comment Box */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Comment
        </label>
        <textarea
          placeholder="Add additional notes about the lead"
          rows={4}
          className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 btn-primary text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default CreateLeadForm;