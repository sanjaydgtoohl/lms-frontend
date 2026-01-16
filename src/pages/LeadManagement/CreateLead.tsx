import React, { useState, useEffect } from 'react';
import LeadManagementSection from '../../components/forms/CreateLead/LeadManagementSection';
import ContactPersonsCard from '../../components/forms/CreateLead/ContactPersonsCard';
import AssignPriorityCard from '../../components/forms/CreateLead/AssignPriorityCard';
import CommentSection from '../../components/forms/CreateLead/CommentSection';
import { MasterFormHeader, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { fetchBrands, fetchAgencies, createLead } from '../../services/CreateLead';
import { showSuccess } from '../../utils/notifications';


const CreateLead: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'brand' | 'agency'>('brand');
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Helper to clear error for dropdownValue (brand/agency)
  const clearDropdownError = (val: string) => {
    setError(prev => (prev && val ? null : prev));
  };

  // Priority state
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [assignTo, setAssignTo] = useState<string | undefined>(undefined);
  const [callFeedback, setCallFeedback] = useState<string | undefined>(undefined);
  const [contacts, setContacts] = useState<any[]>([{ id: '1', fullName: '', profileUrl: '', email: '', mobileNo: '', mobileNo2: '', showSecondMobile: false, type: '', designation: '', agencyBrand: '', subSource: '', department: '', country: '', state: '', city: '', zone: '', postalCode: '' }]);
  const [contactErrors, setContactErrors] = useState<Record<string, Partial<Record<string, string>>>>({});

  // Helper to clear error for a field as soon as it is valid
  const clearContactFieldError = (contactId: string, field: string, value: any) => {
    setContactErrors(prev => {
      if (!prev[contactId] || !prev[contactId][field]) return prev;
      let valid = true;
      if (field === 'mobileNo') {
        const str = String(value);
        valid = !!str && /^[0-9]+$/.test(str) && str.length === 10;
      } else {
        valid = !!value;
      }
      if (valid) {
        const { [field]: omit, ...restFields } = prev[contactId] || {};
        const updated = { ...prev, [contactId]: restFields };
        // Remove contactId if no errors left
        if (Object.keys(updated[contactId] || {}).length === 0) {
          const { [contactId]: omitId, ...rest } = updated;
          return rest;
        }
        return updated;
      }
      return prev;
    });
  };
  const [comment, setComment] = useState<string>('');
  const [saving, setSaving] = useState(false);
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
    // Validate minimal required fields and submit to API
    (async () => {
      // clear previous errors
      setContactErrors({});

      if (!contacts || contacts.length === 0) {
        // Show error under Full Name of the (first) contact card
        setContactErrors({ '1': { fullName: 'Please add at least one contact person.' } });
        return;
      }

      const lead = contacts[0];
      const firstContactId = lead.id || '1';

      const newContactErrors: Record<string, Partial<Record<string, string>>> = {};
      // Required fields validation for all * fields
      if (!lead.fullName) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), fullName: 'Please provide contact name.' };
      }
      // Mobile number validation: only numbers, exactly 10 digits, no alphabets or special characters
      if (!lead.mobileNo) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), mobileNo: 'Please provide mobile number.' };
      } else {
        const mobileNoStr = String(lead.mobileNo);
        if (!/^[0-9]+$/.test(mobileNoStr)) {
          newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), mobileNo: 'Mobile number must contain only digits.' };
        } else if (mobileNoStr.length !== 10) {
          newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), mobileNo: 'Mobile number must be exactly 10 digits.' };
        }
      }
      if (!lead.type) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), type: 'Please select type.' };
      }
      if (!lead.designation) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), designation: 'Please select designation.' };
      }
      if (!lead.department) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), department: 'Please select department.' };
      }
      if (!lead.country) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), country: 'Please select country.' };
      }
      if (!lead.subSource) {
        newContactErrors[firstContactId] = { ...(newContactErrors[firstContactId] || {}), subSource: 'Please select sub-source.' };
      }
      // Validate dropdownValue (brand/agency)
      if (!dropdownValue) {
        setError(selectedOption === 'brand' ? 'Please select a brand.' : 'Please select an agency.');
        setContactErrors(newContactErrors);
        return;
      } else {
        setError(null);
      }
      if (Object.keys(newContactErrors).length > 0) {
        setContactErrors(newContactErrors);
        return;
      }

      const mobile_number = [lead.mobileNo].filter(Boolean);
      if (lead.mobileNo2) mobile_number.push(lead.mobileNo2);

      // Helper: extract numeric id from possibly-formatted id strings like "#USR001"
      const extractNumericId = (val?: string | number) => {
        if (val === undefined || val === null) return undefined;
        const s = String(val);
        const digits = s.replace(/\D+/g, '');
        return digits ? Number(digits) : undefined;
      };

      const payload: any = {
        name: lead.fullName,
        email: lead.email || null,
        profile_url: lead.profileUrl || null,
        mobile_number,
        // current_assign_user must be numeric id — extract digits from formatted id if needed
        current_assign_user: extractNumericId(assignTo),
        priority_id: priority ? Number(priority) : undefined,
        type: lead.type || undefined,
        designation_id: lead.designation ? Number(lead.designation) : undefined,
        department_id: lead.department ? Number(lead.department) : undefined,
        sub_source_id: lead.subSource ? Number(lead.subSource) : undefined,
        country_id: lead.country ? Number(lead.country) : undefined,
        state_id: lead.state ? Number(lead.state) : undefined,
        city_id: lead.city ? Number(lead.city) : undefined,
        zone_id: lead.zone ? Number(lead.zone) : undefined,
        postal_code: lead.postalCode || undefined,
        comment: comment || undefined,
        call_status_id: callFeedback ? Number(callFeedback) : undefined,
      };

      if (selectedOption === 'brand') payload.brand_id = dropdownValue || undefined;
      else payload.agency_id = dropdownValue || undefined;

      try {
        setSaving(true);
        const res = await createLead(payload);
        if (res.error) {
          // If server returned field errors, map them to contact fields to show inline
          if (res.errors && typeof res.errors === 'object') {
            const serverErrors = res.errors as Record<string, any>;
            const mapped: Record<string, Partial<Record<string, string>>> = {};
            const contactId = firstContactId;
            Object.keys(serverErrors).forEach((k) => {
              const messages = Array.isArray(serverErrors[k]) ? serverErrors[k] : [serverErrors[k]];
              // map backend keys to contact field keys
              const keyMap: Record<string, string> = {
                name: 'fullName',
                mobile_number: 'mobileNo',
                type: 'type',
                designation_id: 'designation',
                department_id: 'department',
                sub_source_id: 'subSource',
                country_id: 'country',
              };
              const target = keyMap[k] || k;
              mapped[contactId] = { ...(mapped[contactId] || {}), [target]: String(messages[0]) };
            });
            setContactErrors(mapped);
            return;
          }
          return;
        }
        showSuccess('Lead created successfully.');
        navigate('/lead-management/all-leads');
      } catch (err: any) {
        setError(err?.message || 'Failed to create lead');
      } finally {
        setSaving(false);
      }
    })();
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
          onChange={(val) => {
            setDropdownValue(val);
            clearDropdownError(val);
          }}
          options={options}
          loading={loading}
          error={error}
        />

        <ContactPersonsCard
          initialContacts={contacts}
          onChange={(c) => {
            const updated = c && c.length > 0 ? c : [{ id: '1', fullName: '', profileUrl: '', email: '', mobileNo: '', mobileNo2: '', showSecondMobile: false, type: '', designation: '', agencyBrand: '', subSource: '', department: '', country: '', state: '', city: '', zone: '', postalCode: '' }];
            setContacts(updated);
            // Clear errors for fields that are now valid
            const lead = updated[0];
            const id = lead.id || '1';
            clearContactFieldError(id, 'fullName', lead.fullName);
            clearContactFieldError(id, 'mobileNo', lead.mobileNo);
            clearContactFieldError(id, 'type', lead.type);
            clearContactFieldError(id, 'designation', lead.designation);
            clearContactFieldError(id, 'department', lead.department);
            clearContactFieldError(id, 'country', lead.country);
            clearContactFieldError(id, 'subSource', lead.subSource);
          }}
          errors={contactErrors}
        />

        <AssignPriorityCard
          assignTo={assignTo}
          priority={priority}
          callFeedback={callFeedback}
          onChange={({ assignTo: newAssignTo, priority: newPriority, callFeedback: newCallFeedback }) => {
            if (newAssignTo !== undefined) setAssignTo(newAssignTo);
            if (newPriority !== undefined) setPriority(newPriority);
            if (newCallFeedback !== undefined) setCallFeedback(newCallFeedback);
          }}
        />

        <CommentSection value={comment} onChange={setComment} />

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateLead;
