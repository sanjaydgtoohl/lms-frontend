import React, { useCallback, useState } from 'react';
import SelectField from '../../ui/SelectField';
import ModalPopup from '../../ui/ModalPopup';
import { Button } from '../../ui';
import type { Props } from '../../../types/LeadManagentForm';

const LeadManagementSection: React.FC<Props> = ({
  selectedOption,
  onSelectOption,
  value,
  onChange = () => { },
  options = [],
  loading = false,
  error = null,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setCreateName('');
    setCreateError(null);
  }, []);

  const openCreateModal = () => {
    setCreateName('');
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCreateClick = () => {
    const name = createName.trim();
    if (!name) {
      setCreateError('Please enter a name.');
      return;
    }
    setCreateError(null);
    // Create brand/agency API will be wired here later (no save yet).
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6 bg-gray-50 rounded-2xl ">
        <div className="flex items-center mb-6">
          <h3 className="text-base font-semibold text-gray-800">Lead Management</h3>
        </div>

        <div className="flex items-center flex-wrap gap-6 mb-6">
          <label className="relative flex items-center cursor-pointer group">
            <div className="group-hover:bg-[rgba(66,133,244,0.05)] absolute -inset-2 rounded-md transition-colors duration-200" />
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'brand'}
              onChange={() => onSelectOption('brand')}
              className="relative form-radio w-[18px] h-[18px] border-2 border-[#DDE1E7] 
                       text-[#4285F4] focus:ring-[#4285F4] focus:ring-offset-2
                       transition-all duration-200"
            />
            <span className="relative ml-2.5 text-sm font-medium text-gray-800">
              Select Existing Brand
            </span>
          </label>

          <label className="relative flex items-center cursor-pointer group">
            <div className="group-hover:bg-[rgba(66,133,244,0.05)] absolute -inset-2 rounded-md transition-colors duration-200" />
            <input
              type="radio"
              name="leadType"
              checked={selectedOption === 'agency'}
              onChange={() => onSelectOption('agency')}
              className="relative form-radio w-[18px] h-[18px] border-2 border-[#DDE1E7]
                       text-[#4285F4] focus:ring-[#4285F4] focus:ring-offset-2
                       transition-all duration-200"
            />
            <span className="relative ml-2.5 text-sm font-medium text-gray-800">
              Select Existing Agency
            </span>
          </label>
        </div>

        {(selectedOption === 'brand' || selectedOption === 'agency') && (
          <div className="w-full">
            <div className="flex items-center justify-between gap-1 mb-1">
              <label className="block text-sm text-gray-800">
                {selectedOption === 'brand' ? 'Select Brand' : 'Select Agency'}
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="!text-sm !py-1 !px-0 underline whitespace-nowrap hover:!text-orange-500 "
                onClick={openCreateModal}
              >
                {selectedOption === 'brand' ? 'Create Brand' : 'Create Agency'}
              </Button>
            </div>

            <SelectField
              placeholder={selectedOption === 'brand' ? 'Choose Existing Brand' : 'Choose Existing Agency'}
              options={options}
              value={value}
              onChange={(v) => onChange(typeof v === 'string' ? v : v[0] ?? '')}
              inputClassName="w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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

      <ModalPopup
        show={showCreateModal}
        onClose={closeCreateModal}
        title={selectedOption === 'brand' ? 'Create Brand' : 'Create Agency'}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="create-brand-agency-name" className="mb-1 block text-sm font-medium text-gray-800">
              {selectedOption === 'brand' ? 'Brand name' : 'Agency name'}
            </label>
            <input
              id="create-brand-agency-name"
              type="text"
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value);
                if (createError) setCreateError(null);
              }}
              placeholder={selectedOption === 'brand' ? 'Enter brand name' : 'Enter agency name'}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-200 focus:ring-1 focus:ring-gray-200"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateClick();
                }
              }}
            />
            {createError ? <p className="mt-1.5 text-xs text-red-600">{createError}</p> : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="button" className="btn-secondary" onClick={closeCreateModal}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleCreateClick}>
              {selectedOption === 'brand' ? 'Create Brand' : 'Create Agency'}
            </button>
          </div>
        </div>
      </ModalPopup>
    </div>
  );
};

export default LeadManagementSection;
