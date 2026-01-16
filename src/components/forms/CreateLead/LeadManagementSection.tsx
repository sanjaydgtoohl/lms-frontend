import React from 'react';
import SelectField from '../../ui/SelectField';

interface Props {
  selectedOption: 'brand' | 'agency';
  onSelectOption: (v: 'brand' | 'agency') => void;
  value?: string;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  loading?: boolean;
  error?: string | null;
}

const LeadManagementSection: React.FC<Props> = ({
  selectedOption,
  onSelectOption,
  value,
  onChange = () => {},
  options = [],
  loading = false,
  error = null,
}) => {

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
      <div className="p-6 bg-[#F9FAFB]">
        <div className="flex items-center mb-6">
          <h3 className="text-base font-semibold text-[#344054]">Lead Management</h3>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <label className="relative flex items-center cursor-pointer group">
            <div className="group-hover:bg-[rgba(66,133,244,0.05)] absolute -inset-2 rounded-md transition-colors duration-200"/>
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'brand'}
              onChange={() => onSelectOption('brand')}
              className="relative form-radio w-[18px] h-[18px] border-2 border-[#DDE1E7] 
                       text-[#4285F4] focus:ring-[#4285F4] focus:ring-offset-2
                       transition-all duration-200"
            />
            <span className="relative ml-2.5 text-sm font-medium text-[#374151]">
              Select Existing Brand
            </span>
          </label>

          <label className="relative flex items-center cursor-pointer group">
            <div className="group-hover:bg-[rgba(66,133,244,0.05)] absolute -inset-2 rounded-md transition-colors duration-200"/>
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'agency'}
              onChange={() => onSelectOption('agency')}
              className="relative form-radio w-[18px] h-[18px] border-2 border-[#DDE1E7]
                       text-[#4285F4] focus:ring-[#4285F4] focus:ring-offset-2
                       transition-all duration-200"
            />
            <span className="relative ml-2.5 text-sm font-medium text-[#374151]">
              Select Existing Agency
            </span>
          </label>
        </div>

        {(selectedOption === 'brand' || selectedOption === 'agency') && (
          <div className="w-full">
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              {selectedOption === 'brand' ? 'Select Brand' : 'Select Agency'}
            </label>
            <SelectField
              placeholder={selectedOption === 'brand' ? 'Choose Existing Brand' : 'Choose Existing Agency'}
              options={options}
              value={value}
              onChange={(v) => onChange(typeof v === 'string' ? v : v[0] ?? '')}
              inputClassName="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            {loading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
            {!loading && !error && options.length === 0 && (
              <div className="text-xs text-gray-400 mt-1">No options found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManagementSection;
