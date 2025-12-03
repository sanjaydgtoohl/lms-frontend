import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import Table, { type Column } from '../../components/ui/Table';
import { Mail, Eye } from 'lucide-react';
import { ROUTES } from '../../constants';
import LeadManagementSection from '../../components/forms/CreateLead/LeadManagementSection';
import ContactPersonsCard from '../../components/forms/CreateLead/ContactPersonsCard';
import AssignPriorityCard from '../../components/forms/CreateLead/AssignPriorityCard';
import { Button } from '../../components/ui';

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
  priority?: string;
  callFeedback?: string;
}

const EditLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [selectedOption, setSelectedOption] = useState<'brand' | 'agency'>('brand');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(\`/api/leads/\${id}\`);
        // const data = await response.json();
        
        // Mock data for now
        const mockLead: Lead = {
          id: id || '',
          selectedOption: 'brand',
          brandId: '1',
          contacts: [{
            id: '1',
            fullName: 'John Doe',
            profileUrl: '',
            email: 'john@example.com',
            mobileNo: '1234567890',
            mobileNo2: '',
            showSecondMobile: false,
            type: 'Primary',
            designation: 'Manager',
            agencyBrand: 'Nike',
            subSource: 'Website',
            department: 'Marketing',
            country: 'USA',
            state: 'CA',
            city: 'San Francisco',
            zone: 'West',
            postalCode: '94105'
          }],
          assignTo: 'Sales Man 1',
          priority: 'high',
          callFeedback: 'Interested'
        };

        setLead(mockLead);
        setSelectedOption(mockLead.selectedOption);
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

  const handleSubmit = async () => {
    try {
      // TODO: Implement actual update logic
      console.log('Updating lead...', { id, lead });
      navigate(ROUTES.LEAD_MANAGEMENT);
    } catch (error) {
      console.error('Error updating lead:', error);
      // TODO: Show error notification
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
        onClose={() => navigate(ROUTES.LEAD_MANAGEMENT)}
      />

      <div className="space-y-6">
        <LeadManagementSection
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          value={selectedOption === 'brand' ? lead.brandId : lead.agencyId}
          onChange={(value) => {
            setLead(prev => {
              if (!prev) return prev;
              return selectedOption === 'brand'
                ? { ...prev, brandId: value }
                : { ...prev, agencyId: value };
            });
          }}
        />

        <ContactPersonsCard
          initialContacts={lead.contacts}
          onChange={(contacts) => {
            setLead(prev => prev ? { ...prev, contacts } : null);
          }}
        />

        <AssignPriorityCard
          assignTo={lead.assignTo}
          priority={lead.priority}
          callFeedback={lead.callFeedback}
          onChange={({ assignTo, priority, callFeedback }) => {
            setLead(prev => prev ? { ...prev, assignTo, priority, ...(callFeedback !== undefined ? { callFeedback } : {}) } : null);
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
              {/* Build table rows from lead.contacts or fallback sample */}
              {
                (() => {
                  const rows = lead.contacts && lead.contacts.length > 0 ? lead.contacts.map((c, i) => ({
                    id: c.id,
                    assignTo: lead.assignTo || '-',
                    callStatus: i % 2 === 0 ? 'Not Interested' : 'Meeting Done',
                    lastCallStatus: '02-07-2025 22:23',
                    meetingDateTime: i % 2 === 0 ? '-' : '02-07-2025 22:23',
                    comment: 'According to Form'
                  })) : Array.from({ length: 3 }).map((_, i) => ({
                    id: String(i),
                    assignTo: lead.assignTo || '-',
                    callStatus: 'Not Interested',
                    lastCallStatus: '02-07-2025 22:23',
                    meetingDateTime: '-',
                    comment: 'According to Form'
                  }));

                  type Row = typeof rows[number];

                  const columns: Column<Row>[] = [
                    { key: 'assignTo', header: 'Assigned To', render: (r) => r.assignTo, className: 'text-left whitespace-nowrap' },
                    { key: 'callStatus', header: 'Call Status', render: (r) => r.callStatus, className: 'whitespace-nowrap' },
                    { key: 'lastCallStatus', header: 'Last Call Status', render: (r) => r.lastCallStatus, className: 'whitespace-nowrap' },
                    { key: 'meetingDateTime', header: 'Meeting Date & Time', render: (r) => r.meetingDateTime, className: 'whitespace-nowrap' },
                    { key: 'comment', header: 'Comment', render: (r) => r.comment, className: 'max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap' },
                  ];

                  return (
                            <Table<Row>
                              data={rows}
                              columns={columns}
                              startIndex={0}
                              loading={false}
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