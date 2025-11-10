import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterFormHeader } from '../../components/ui';
import { ROUTES } from '../../constants';

interface Lead {
  id: string;
  brandName: string;
  contactPerson: string;
  phoneNumber: string;
  source: string;
  subSource: string;
  assignBy: string;
  assignTo: string;
  dateTime: string;
  status: string;
  callStatus: string;
  callAttempt: number;
  comment: string;
}

const ViewLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // Mock data for now
        const mockLead: Lead = {
          id: id || '',
          brandName: 'Nike',
          contactPerson: 'Phoenix Baker',
          phoneNumber: '8797099888',
          source: 'FB',
          subSource: 'Website',
          assignBy: 'Shivika',
          assignTo: 'Sales Man 1',
          dateTime: '02-07-2025 22:23',
          status: 'Interested',
          callStatus: 'Follow Up',
          callAttempt: 2,
          comment: 'According to Form'
        };

        setLead(mockLead);
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLead();
    }
  }, [id]);

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
        <div className="text-lg text-gray-500">Lead not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <MasterFormHeader onBack={() => navigate('/lead-management/all-leads')} title="View Lead" />
      
      <div className="bg-white border border-[var(--border-color)] rounded-xl shadow-sm p-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Brand Name</div>
              <div className="text-base text-[var(--text-primary)]">{lead.brandName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Contact Person</div>
              <div className="text-base text-[var(--text-primary)]">{lead.contactPerson}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Phone Number</div>
              <div className="text-base text-[var(--text-primary)]">{lead.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Source</div>
              <div className="text-base text-[var(--text-primary)]">{lead.source}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Sub Source</div>
              <div className="text-base text-[var(--text-primary)]">{lead.subSource}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-base text-[var(--text-primary)]">{lead.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Call Status</div>
              <div className="text-base text-[var(--text-primary)]">{lead.callStatus}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Call Attempts</div>
              <div className="text-base text-[var(--text-primary)]">{lead.callAttempt}</div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-sm text-gray-600">Comment</div>
            <div className="text-base text-[var(--text-primary)]">{lead.comment}</div>
          </div>

          <div className="col-span-2 border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600">Assigned By</div>
                <div className="text-base text-[var(--text-primary)]">{lead.assignBy}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Assigned To</div>
                <div className="text-base text-[var(--text-primary)]">{lead.assignTo}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLead;