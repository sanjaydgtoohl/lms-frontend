import React, { useState, useEffect } from 'react';
import LeadManagementSection from '../../components/forms/CreateLead/LeadManagementSection';
import ContactPersonsCard from '../../components/forms/CreateLead/ContactPersonsCard';
import AssignPriorityCard from '../../components/forms/CreateLead/AssignPriorityCard';
import CommentSection from '../../components/forms/CreateLead/CommentSection';
import { MasterFormHeader, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { fetchBrands, fetchAgencies } from '../../services/CreateLead';


const CreateLead: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'brand' | 'agency'>('brand');
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Priority state
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  // Fetch dropdown data when selectedOption changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setOptions([]);
    setDropdownValue('');
    const fetchData = async () => {
      const fetchFn = selectedOption === 'brand' ? fetchBrands : fetchAgencies;
      const { data, error } = await fetchFn();
      if (!isMounted) return;
      if (error) {
        setError(error);
        setOptions([]);
      } else {
        setOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
      }
      setLoading(false);
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedOption]);

  const handleSave = () => {
    // TODO: Collect form state and submit to API
    navigate('/lead-management/all-leads');
  };

  // Custom render for LeadManagementSection to pass dropdown data
  return (
    <div className="flex-1 p-6 w-full max-w-full">
      <MasterFormHeader onBack={() => navigate(-1)} title="Create Lead" />

      <div className="space-y-6">
        <LeadManagementSection
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          value={dropdownValue}
          onChange={setDropdownValue}
          options={options}
          loading={loading}
          error={error}
        />

        <ContactPersonsCard />

        <AssignPriorityCard
          priority={priority}
          onChange={({ priority: newPriority }) => setPriority(newPriority)}
        />

        <CommentSection />

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateLead;
