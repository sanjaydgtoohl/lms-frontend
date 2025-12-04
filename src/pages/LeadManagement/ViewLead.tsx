import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, User, Briefcase, Calendar, Flag } from 'lucide-react';
import { ROUTES } from '../../constants';
import { Button } from '../../components/ui';
import { fetchLeadById } from '../../services/ViewLead';
import type { Lead as ApiLead } from '../../services/ViewLead';
import Breadcrumb from '../../components/ui/Breadcrumb';


const ViewLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState<ApiLead | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      setIsLoading(true);
      const data = await fetchLeadById(id || '');
      setLead(data);
      setIsLoading(false);
    };
    if (id) fetchLead();
  }, [id]);

  const handleBack = () => {
    navigate(ROUTES.LEAD_MANAGEMENT);
  };
  const handleMeetingSchedule = () => {
    navigate(ROUTES.LEAD.MEETING_SCHEDULE);
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
      '1': 'bg-blue-100 text-blue-800',
      '2': 'bg-yellow-100 text-yellow-800',
      '3': 'bg-green-100 text-green-800',
      '4': 'bg-red-100 text-red-800',
      '5': 'bg-purple-100 text-purple-800',
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
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb currentPageTitle={lead.name || 'Lead'} />
      </div>
      {/* Header with Back Button and Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.brand?.name || 'Lead'}
            </h1>
            <p className="text-gray-600 mt-1">Contact: {lead.name} • Lead ID: {lead.id}</p>
          </div>
          <Button variant="primary" onClick={handleMeetingSchedule}>
            Meeting Schedule
          </Button>
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
              {/* Brand */}
              <div>
                <label className="text-sm font-medium text-gray-600">Brand</label>
                <p className="text-base font-semibold text-gray-900 mt-2">{lead.brand?.name || '-'}</p>
              </div>
              {/* Sub Source */}
              <div>
                <label className="text-sm font-medium text-gray-600">Lead Source</label>
                <p className="text-base font-semibold text-gray-900 mt-2">{lead.sub_source?.name || '-'}</p>
              </div>
              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-base font-semibold text-gray-900 mt-2">{lead.type}</p>
              </div>
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status === '1' ? 'Active' : lead.status}
                  </span>
                </div>
              </div>
              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <div className="mt-2 flex items-center">
                  <Flag size={16} className={`mr-2 ${getPriorityColor(lead.priority?.name || 'Medium')}`} />
                  <span className="text-base font-medium text-gray-900">{lead.priority?.name || 'Not Set'}</span>
                </div>
              </div>
              {/* Lead Status */}
              <div>
                <label className="text-sm font-medium text-gray-600">Lead Status</label>
                <p className="text-base font-medium text-gray-900 mt-2">{lead.lead_status || '-'}</p>
              </div>
              {/* Call Status */}
              <div>
                <label className="text-sm font-medium text-gray-600">Call Status</label>
                <p className="text-base font-medium text-gray-900 mt-2">{lead.call_status || '-'}</p>
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
                    Name
                  </div>
                  <p className="text-base font-medium text-gray-900">{lead.name}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <Briefcase size={16} className="mr-2" />
                    Designation
                  </div>
                  <p className="text-base font-medium text-gray-900">{lead.designation?.name || 'Not Set'}</p>
                </div>
              </div>
              {/* Department */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Department</label>
                <p className="text-base font-medium text-gray-900">{lead.department?.name || 'Not Set'}</p>
              </div>
              {/* Email */}
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <Mail size={16} className="mr-2" />
                  Email
                </div>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-base font-medium text-orange-500 hover:text-orange-600 underline">
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
                  {lead.mobile_number && lead.mobile_number.length > 0 ? (
                    <a href={`tel:${lead.mobile_number[0]}`} className="text-base font-medium text-orange-500 hover:text-orange-600 underline">
                      {lead.mobile_number[0]}
                    </a>
                  ) : (
                    <span className="text-base font-medium text-gray-500">Not provided</span>
                  )}
                </div>
                {lead.mobile_number && lead.mobile_number.length > 1 && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                      <Phone size={16} className="mr-2" />
                      Secondary Phone
                    </div>
                    <a href={`tel:${lead.mobile_number[1]}`} className="text-base font-medium text-orange-500 hover:text-orange-600 underline">
                      {lead.mobile_number[1]}
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
                <p className="text-base font-medium text-gray-900">{lead.country?.name || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">State</label>
                <p className="text-base font-medium text-gray-900">{lead.state?.name || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">City</label>
                <p className="text-base font-medium text-gray-900">{lead.city?.name || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Zone</label>
                <p className="text-base font-medium text-gray-900">{lead.zone?.name || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Postal Code</label>
                <p className="text-base font-medium text-gray-900">{lead.postal_code || 'Not Set'}</p>
              </div>
            </div>
          </div>
          {/* Additional Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {lead.comment && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Comment</label>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-gray-700 leading-relaxed">{lead.comment}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">UUID</label>
                <p className="text-sm text-gray-700 font-mono break-all">{lead.uuid}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          {/* Assignment Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Assignment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Assigned User</label>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-base font-medium text-gray-900">{lead.assigned_user?.name || '-'}</p>
                  <p className="text-xs text-gray-600 mt-1">{lead.assigned_user?.email || ''}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Current Assign User ID</label>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-base font-medium text-gray-900">{lead.current_assign_user}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Call Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Call Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Call Status</label>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-base font-medium text-gray-900">{lead.call_status || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Date & Time Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <Calendar size={16} className="mr-2" />
                  Created
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-base font-medium text-gray-900">{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                  <Calendar size={16} className="mr-2" />
                  Updated
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-base font-medium text-gray-900">{lead.updated_at ? new Date(lead.updated_at).toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ViewLead;