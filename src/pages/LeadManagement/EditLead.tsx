import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import Table, { type Column } from '../../components/ui/Table';
import { Mail, Eye } from 'lucide-react';
import { ROUTES } from '../../constants';
import LeadManagementSection from '../../components/forms/CreateLead/LeadManagementSection';
import ContactPersonsCard from '../../components/forms/CreateLead/ContactPersonsCard';
import AssignPriorityCard from '../../components/forms/CreateLead/AssignPriorityCard';
import { fetchLeadById, fetchLeadHistory } from '../../services/ViewLead';
import { fetchBrands, fetchAgencies } from '../../services/CreateLead';
import { Button } from '../../components/ui';
import { updateLead } from '../../services/AllLeads';
import { showSuccess, showError } from '../../utils/notifications';

import CommentSection from '../../components/forms/CreateLead/CommentSection';

interface Lead {
  id: string;
  selectedOption: 'brand' | 'agency';
  brandId?: string;
  agencyId?: string;
  contacts: Array<{
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
  }>;
  assignTo?: string;
  assignToName?: string;
  priority?: string;
  callFeedback?: string;
  comment?: string;
}
const EditLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [selectedOption, setSelectedOption] = useState<'brand' | 'agency'>('brand');
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setIsLoading(true);

        if (!id) {
          setLead(null);
          return;
        }

        const apiLead = await fetchLeadById(id);

        if (!apiLead) {
          setLead(null);
          return;
        }

        const contact = {
          id: String(apiLead.id),
          fullName: apiLead.name || '',
          profileUrl: apiLead.profile_url || '',
          email: apiLead.email || '',
          mobileNo: Array.isArray(apiLead.mobile_number) ? String(apiLead.mobile_number[0] || '') : '',
          mobileNo2: Array.isArray(apiLead.mobile_number) ? String(apiLead.mobile_number[1] || '') : '',
          showSecondMobile: Array.isArray(apiLead.mobile_number) && apiLead.mobile_number.length > 1,
          type: apiLead.type || '',
          designation: apiLead.designation?.id ? String(apiLead.designation.id) : '',
          agencyBrand: apiLead.brand?.name || (apiLead.agency ? apiLead.agency.name : ''),
          subSource: apiLead.sub_source?.id ? String(apiLead.sub_source.id) : '',
          department: apiLead.department?.id ? String(apiLead.department.id) : '',
          country: apiLead.country?.id ? String(apiLead.country.id) : '',
          state: apiLead.state?.id ? String(apiLead.state.id) : '',
          city: apiLead.city?.id ? String(apiLead.city.id) : '',
          zone: apiLead.zone?.id ? String(apiLead.zone.id) : '',
          postalCode: apiLead.postal_code || '',
        };

        const mappedLead: Lead = {
          id: String(apiLead.id),
          selectedOption: apiLead.brand_id ? 'brand' : (apiLead.agency_id ? 'agency' : 'brand'),
          brandId: apiLead.brand_id ? String(apiLead.brand_id) : undefined,
          agencyId: apiLead.agency_id ? String(apiLead.agency_id) : undefined,
          contacts: [contact],
          assignTo: apiLead.assigned_user?.id ? String(apiLead.assigned_user.id) : undefined,
          assignToName: apiLead.assigned_user?.name || undefined,
          priority: apiLead.priority?.slug || (apiLead.priority?.id ? String(apiLead.priority.id) : undefined),
          callFeedback: apiLead.call_status || undefined,
          comment: apiLead.comment || '',
        };

        setLead(mappedLead);
        setSelectedOption(mappedLead.selectedOption);
        // set initial dropdownValue from mapped lead
        setDropdownValue(mappedLead.selectedOption === 'brand' ? (mappedLead.brandId || '') : (mappedLead.agencyId || ''));
      } catch (error) {
        console.error('Error fetching lead:', error);
        // TODO: Show error notification
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLead();
    }
  }, [id]);

  // Fetch lead history when lead is loaded
  useEffect(() => {
    let mounted = true;
    const loadHistory = async () => {
      if (!lead?.id) return;
      setHistoryLoading(true);
      try {
        const data = await fetchLeadHistory(lead.id);
        if (!mounted) return;
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setHistory([]);
      } finally {
        if (!mounted) return;
        setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => { mounted = false; };
  }, [lead?.id]);

  // Fetch brand/agency options when selectedOption changes
  useEffect(() => {
    let isMounted = true;
    setOptionsLoading(true);
    setOptionsError(null);
    setOptions([]);

    const fetchData = async () => {
      const fetchFn = selectedOption === 'brand' ? fetchBrands : fetchAgencies;
      try {
        const { data, error } = await fetchFn();
        if (!isMounted) return;
        if (error) {
          setOptionsError(error as string);
          setOptions([]);
        } else {
          const fetched = Array.isArray(data) ? data.map((it: any) => ({ value: String(it.id), label: it.name })) : [];
          // If there's an existing selected value that's not present in fetched options,
          // add it using the lead's stored name so the select shows the current value.
          if (dropdownValue) {
            const exists = fetched.find((o: any) => o.value === dropdownValue);
            if (!exists) {
              // Try to get a label from the currently loaded lead
              const existingLabel = selectedOption === 'brand'
                ? (lead?.contacts?.[0]?.agencyBrand || lead?.brandId)
                : (lead?.contacts?.[0]?.agencyBrand || lead?.agencyId);
              fetched.unshift({ value: dropdownValue, label: String(existingLabel || dropdownValue) });
            }
          }
          setOptions(fetched);
        }
      } catch (err) {
        if (!isMounted) return;
        setOptionsError('Failed to load options');
        setOptions([]);
      } finally {
        if (!isMounted) return;
        setOptionsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [selectedOption, dropdownValue, lead]);

  // Keep lead's brandId/agencyId in sync when dropdownValue changes
  useEffect(() => {
    setLead(prev => {
      if (!prev) return prev;
      return selectedOption === 'brand' ? { ...prev, brandId: dropdownValue } : { ...prev, agencyId: dropdownValue };
    });
  }, [dropdownValue, selectedOption]);

  const handleSubmit = async () => {
    if (!lead) return;

    const extractNumericId = (val?: string | number) => {
      if (val === undefined || val === null) return undefined;
      const s = String(val);
      const digits = s.replace(/\D+/g, '');
      return digits ? Number(digits) : undefined;
    };

    // SUB_SOURCE_MAP removed, subSource now contains the ID directly

    try {
      const contact = lead.contacts && lead.contacts.length ? lead.contacts[0] : null;

      const mobile_number: string[] = [];
      if (contact?.mobileNo) mobile_number.push(contact.mobileNo);
      if (contact?.mobileNo2) mobile_number.push(contact.mobileNo2);

      // Fix: Ensure call feedback ID is submitted
      const callStatusId = extractNumericId(lead.callFeedback);

      const payload: Record<string, any> = {
        name: contact?.fullName || undefined,
        email: contact?.email || null,
        profile_url: contact?.profileUrl || null,
        mobile_number: mobile_number.length ? mobile_number : undefined,
        current_assign_user: extractNumericId(lead.assignTo),
        priority_id: lead.priority ? extractNumericId(lead.priority) : undefined,
        type: contact?.type || undefined,
        designation_id: contact?.designation ? Number(contact.designation) : undefined,
        department_id: contact?.department ? Number(contact.department) : undefined,
        sub_source_id: contact?.subSource ? Number(contact.subSource) : undefined,
        country_id: contact?.country ? Number(contact.country) : undefined,
        state_id: contact?.state ? Number(contact.state) : undefined,
        city_id: contact?.city ? Number(contact.city) : undefined,
        zone_id: contact?.zone ? Number(contact.zone) : undefined,
        postal_code: contact?.postalCode || undefined,
        comment: typeof lead.comment === 'string' ? lead.comment : (lead.comment ? String(lead.comment) : ''),
        call_status_id: callStatusId,
      };

      if (selectedOption === 'brand') payload.brand_id = lead.brandId || undefined;
      else payload.agency_id = lead.agencyId || undefined;

      await updateLead(id || '', payload);
      // Assume updateLead throws on error or returns the updated item
      showSuccess('Lead updated successfully.');
      navigate(ROUTES.LEAD_MANAGEMENT);
    } catch (error: any) {
      console.error('Error updating lead:', error);
      showError(error?.message || 'Failed to update lead');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-500">Lead not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterCreateHeader
        onClose={() => navigate('/lead-management/all-leads')}
      />

      <div className="space-y-6">
        <LeadManagementSection
          selectedOption={selectedOption}
          onSelectOption={(opt) => {
            setSelectedOption(opt);
            // when switching, keep dropdownValue in sync with lead
            setDropdownValue(opt === 'brand' ? (lead?.brandId || '') : (lead?.agencyId || ''));
          }}
          value={dropdownValue}
          onChange={(value) => {
            setDropdownValue(value);
          }}
          options={options}
          loading={optionsLoading}
          error={optionsError}
        />

        <ContactPersonsCard
          initialContacts={lead.contacts}
          onChange={(contacts) => {
            setLead(prev => prev ? { ...prev, contacts } : null);
          }}
        />

        <AssignPriorityCard
          assignTo={lead.assignTo}
          assignedLabel={lead.assignToName}
          priority={lead.priority}
          callFeedback={lead.callFeedback}
          onChange={({ assignTo, priority, callFeedback }) => {
            setLead(prev => prev ? { ...prev, assignTo, priority, ...(callFeedback !== undefined ? { callFeedback } : {}) } : null);
          }}
        />

        {/* Comment Card Section */}
        <CommentSection
          value={lead.comment || ''}
          onChange={(value) => {
            setLead(prev => prev ? { ...prev, comment: value } : null);
          }}
        />

        <div className="flex justify-end space-x-4 pt-2">
          <Button 
            onClick={() => navigate(ROUTES.LEAD_MANAGEMENT)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update
          </Button>
        </div>

        {/* Email Activity Section */}
        <div className="bg-[#F9F9F9] rounded-2xl shadow-sm border border-[var(--border-color)] p-4">
          <h3 className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Email Activity</h3>
          <div className="space-y-3">
            {['Subject Line 1', 'Subject Line 2', 'Subject Line 3'].map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="text-sm text-[var(--text-primary)]">{sub}</div>
                </div>
                <div className="text-[var(--text-secondary)]">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Details Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          <div className="px-4 py-3">
            <div className="overflow-y-auto max-h-[280px]">
              {/* Render call history rows from API (fallback to sample rows) */}
              {
                (() => {
                  const formatDateTime = (date: string | null | undefined) => {
                    if (!date) return '-';
                    try {
                      return new Date(date).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                    } catch {
                      return '-';
                    }
                  };

                  const rows = history && history.length > 0 ? history.map((h: any) => ({
                    id: String(h.id || h.uuid),
                    assignedTo: h.assigned_user?.name || '-',
                    currentUser: h.current_user?.name || '-',
                    priority: h.priority?.name || h.priority?.slug || '-',
                    status: h.status?.name || '-',
                    callStatus: h.call_status?.name || '-',
                    meetingDateTime: h.meeting_date ? formatDateTime(h.meeting_date) : '-',
                    createdAt: formatDateTime(h.created_at),
                    comment: h.lead_comment || '-'
                  })) : Array.from({ length: 3 }).map((_, i) => ({
                    id: String(i),
                    assignedTo: lead.assignToName || lead.assignTo || '-',
                    currentUser: '-',
                    priority: '-',
                    status: '-',
                    callStatus: 'Not Interested',
                    meetingDateTime: '-',
                    createdAt: '-',
                    comment: 'According to Form'
                  }));

                  type Row = typeof rows[number];

                  const columns: Column<Row>[] = [
                    { key: 'assignedTo', header: 'Assigned To', render: (r) => r.assignedTo, className: 'text-left whitespace-nowrap' },
                    { key: 'currentUser', header: 'Current User', render: (r) => r.currentUser, className: 'whitespace-nowrap' },
                    { key: 'priority', header: 'Priority', render: (r) => r.priority, className: 'whitespace-nowrap' },
                    { key: 'status', header: 'Status', render: (r) => r.status, className: 'whitespace-nowrap' },
                    { key: 'callStatus', header: 'Call Status', render: (r) => r.callStatus, className: 'whitespace-nowrap' },
                    { key: 'meetingDateTime', header: 'Meeting Date & Time', render: (r) => r.meetingDateTime, className: 'whitespace-nowrap' },
                    { key: 'createdAt', header: 'Created At', render: (r) => r.createdAt, className: 'whitespace-nowrap' },
                    { key: 'comment', header: 'Comment', render: (r) => r.comment, className: 'max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap' },
                  ];

                  return (
                            <Table<Row>
                              data={rows}
                              columns={columns}
                              startIndex={0}
                              loading={historyLoading}
                              desktopOnMobile={true}
                              keyExtractor={(it) => it.id}
                            />
                  );
                })()
              }
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default EditLead;