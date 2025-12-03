import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, User, Briefcase, Calendar, Flag, Eye, Edit2 } from 'lucide-react';
import { ROUTES } from '../../constants';
import { Button } from '../../components/ui';

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
  email?: string;
  secondaryPhone?: string;
  designation?: string;
  department?: string;
  country?: string;
  state?: string;
  city?: string;
  zone?: string;
  postalCode?: string;
  priority?: string;
  callFeedback?: string;
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
        // const response = await fetch(`/api/leads/${id}`);
        // const data = await response.json();
        
        // Mock data for now
        const mockLead: Lead = {
          id: id || '',
          brandName: 'Nike',
          contactPerson: 'Phoenix Baker',
          phoneNumber: '8797099888',
          email: 'phoenix.baker@nike.com',
          secondaryPhone: '9876543210',
          source: 'FB',
          subSource: 'Website',
          assignBy: 'Shivika',
          assignTo: 'Sales Man 1',
          dateTime: '02-07-2025 22:23',
          status: 'Interested',
          callStatus: 'Follow Up',
          callAttempt: 2,
          comment: 'Very interested in our services. Follow up meeting scheduled for next week.',
          designation: 'Marketing Manager',
          department: 'Marketing',
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          zone: 'West',
          postalCode: '94105',
          priority: 'High',
          callFeedback: 'Positive'
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

  const handleEdit = () => {
    navigate(ROUTES.LEAD.EDIT(id || ''));
  };

  const handleBack = () => {
    navigate(ROUTES.LEAD_MANAGEMENT);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 w-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <p className="mt-4 text-gray-600">Loading lead details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 p-6 w-full">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Leads
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium text-lg">Lead not found</p>
          <Button
            onClick={handleBack}
            variant="primary"
            className="mt-4"
          >
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Interested': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Meeting Scheduled': 'bg-blue-100 text-blue-800',
      'Not Interested': 'bg-red-100 text-red-800',
      'Converted': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'text-red-500';
    if (priority === 'Medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {/* Header with Back Button and Actions */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Leads
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.brandName}
            </h1>
            <p className="text-gray-600 mt-1">Lead ID: {lead.id} • {lead.dateTime}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="secondary"
            >
              <Eye size={18} className="mr-2" />
              Close
            </Button>
            <Button
              onClick={handleEdit}
              variant="primary"
            >
              <Edit2 size={18} className="mr-2" />
              Edit Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Overview Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Lead Overview</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Lead Source */}
              <div>
                <label className="text-sm font-medium text-gray-600">Lead Source</label>
                <p className="text-base font-semibold text-gray-900 mt-2">{lead.source}</p>
              </div>

              {/* Sub Source */}
              <div>
                <label className="text-sm font-medium text-gray-600">Sub Source</label>
                <p className="text-base font-semibold text-gray-900 mt-2">{lead.subSource}</p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <div className="mt-2 flex items-center">
                  <Flag size={16} className={`mr-2 ${getPriorityColor(lead.priority || 'Medium')}`} />
                  <span className="text-base font-medium text-gray-900">{lead.priority || 'Not Set'}</span>
                </div>
              </div>

              {/* Call Feedback */}
              <div>
                <label className="text-sm font-medium text-gray-600">Call Feedback</label>
                <p className="text-base font-medium text-gray-900 mt-2">{lead.callFeedback || 'Not Set'}</p>
              </div>

              {/* Call Status */}
              <div>
                <label className="text-sm font-medium text-gray-600">Call Status</label>
                <p className="text-base font-medium text-gray-900 mt-2">{lead.callStatus}</p>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              {/* Name and Designation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <User size={16} className="mr-2" />
                    Contact Person
                  </div>
                  <p className="text-base font-medium text-gray-900">{lead.contactPerson}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <Briefcase size={16} className="mr-2" />
                    Designation
                  </div>
                  <p className="text-base font-medium text-gray-900">{lead.designation || 'Not Set'}</p>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Department</label>
                <p className="text-base font-medium text-gray-900">{lead.department || 'Not Set'}</p>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <Mail size={16} className="mr-2" />
                  Email
                </div>
                {lead.email ? (
                  <a 
                    href={`mailto:${lead.email}`}
                    className="text-base font-medium text-orange-500 hover:text-orange-600 underline"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <p className="text-base font-medium text-gray-500">Not provided</p>
                )}
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <Phone size={16} className="mr-2" />
                    Phone Number
                  </div>
                  <a 
                    href={`tel:${lead.phoneNumber}`}
                    className="text-base font-medium text-orange-500 hover:text-orange-600 underline"
                  >
                    {lead.phoneNumber}
                  </a>
                </div>
                {lead.secondaryPhone && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                      <Phone size={16} className="mr-2" />
                      Secondary Phone
                    </div>
                    <a 
                      href={`tel:${lead.secondaryPhone}`}
                      className="text-base font-medium text-orange-500 hover:text-orange-600 underline"
                    >
                      {lead.secondaryPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-6">
              <MapPin size={20} className="mr-2 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">Location Information</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Country</label>
                <p className="text-base font-medium text-gray-900">{lead.country || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">State</label>
                <p className="text-base font-medium text-gray-900">{lead.state || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">City</label>
                <p className="text-base font-medium text-gray-900">{lead.city || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Zone</label>
                <p className="text-base font-medium text-gray-900">{lead.zone || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Postal Code</label>
                <p className="text-base font-medium text-gray-900">{lead.postalCode || 'Not Set'}</p>
              </div>
            </div>
          </div>

          {/* Comment Card */}
          {lead.comment && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments & Notes</h2>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 leading-relaxed">{lead.comment}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          {/* Assignment Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Assignment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Assigned By</label>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-base font-medium text-gray-900">{lead.assignBy}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Assigned To</label>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-base font-medium text-gray-900">{lead.assignTo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Call History</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Total Attempts</label>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{lead.callAttempt}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Last Call</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-base font-medium text-gray-900">{lead.callStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            
            <div>
              <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                <Calendar size={16} className="mr-2" />
                Date & Time
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-base font-medium text-gray-900">{lead.dateTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons at Bottom */}
      <div className="mt-8 flex gap-3 justify-end pb-6">
        <Button
          onClick={handleBack}
          variant="secondary"
        >
          <ChevronLeft size={18} className="mr-1" />
          Close
        </Button>
        <Button
          onClick={handleEdit}
          variant="primary"
        >
          <Edit2 size={18} className="mr-1" />
          Edit Lead
        </Button>
      </div>
    </div>
  );
};

export default ViewLead;