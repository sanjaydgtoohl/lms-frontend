import React from 'react';
import SelectField from '../../ui/SelectField';

interface Props {
  selectedOption: 'brand' | 'agency';
  onSelectOption: (v: 'brand' | 'agency') => void;
  value?: string;
  onChange?: (value: string) => void;
}

const LeadManagementSection: React.FC<Props> = ({ 
  selectedOption, 
  onSelectOption,
  value,
  onChange = () => {} 
}) => {
  return (
    <div className="bg-white border border-[#E7E9EF] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] px-8 py-7 mb-6">
      <h3 className="text-[20px] font-semibold text-[#1F2937] mb-5">Lead Management</h3>

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
          <span className="relative ml-2.5 text-[15px] font-medium text-[#374151]">
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
          <span className="relative ml-2.5 text-[15px] font-medium text-[#374151]">
            Select Existing Agency
          </span>
        </label>
      </div>

      {selectedOption === 'brand' && (
        <div className="w-full">
          <label className="block text-[15px] font-medium text-[#374151] mb-[18px]">
            Select Brand
          </label>
          <SelectField
            placeholder="Choose Existing Brand"
            options={[]}
            value={value}
            onChange={onChange}
            inputClassName="w-full h-11 rounded-[10px] border border-[#DDE1E7] pl-3 
                          transition-all duration-200
                          hover:border hover:border-[#A7B4FF] hover:shadow-[0_0_0_3px_rgba(66,133,244,0.12)]
                          focus:border focus:border-[#A7B4FF] focus:shadow-[0_0_0_3px_rgba(66,133,244,0.12)]"
          />
        </div>
      )}

      {selectedOption === 'agency' && (
        <div className="w-full">
          <label className="block text-[15px] font-medium text-[#374151] mb-[18px]">
            Select Agency
          </label>
          <SelectField
            placeholder="Choose Existing Agency"
            options={[]}
            value={value}
            onChange={onChange}
            inputClassName="w-full h-11 rounded-[10px] border-[#DDE1E7] pl-3
                          transition-all duration-200
                          hover:border-[#A7B4FF] hover:shadow-[0_0_0_3px_rgba(66,133,244,0.12)]
                          focus:border-[#A7B4FF] focus:shadow-[0_0_0_3px_rgba(66,133,244,0.12)]"
          />
        </div>
      )}
    </div>
  );
};

export default LeadManagementSection;
