import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { showSuccess } from '../../utils/notifications';
import { useNavigate } from 'react-router-dom';
import SelectField from '../../components/ui/SelectField';
import { createMeeting } from '../../services/MeetingSchedule';
import { listAttendees } from '../../services/AllUsers';
import { listLeads } from '../../services/AllLeads';
import MultiSelectDropdown from '../../components/ui/MultiSelectDropdown';

const MeetingSchedule: React.FC = () => {
  const navigate = useNavigate();

  // Disable datepicker animations on component mount
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .react-datepicker-popper {
        animation: none !important;
        transition: none !important;
      }
      .react-datepicker {
        animation: none !important;
      }
      /* Fix multi-select placeholder width */
      div[style*="gap: 6px"] input[placeholder] {
        min-width: 120px !important;
        flex: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [lead, setLead] = useState<string>('');
  const [meetingType, setMeetingType] = useState<string>('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [title, setTitle] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [meetLink, setMeetLink] = useState<string>('');
  const [leadOptions, setLeadOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [attendeesOptions, setAttendeesOptions] = useState<Array<{ value: string; label: string }>>([]);
  // Error states for each required field
  const [errors, setErrors] = useState<{
    lead?: string;
    meetingType?: string;
    attendees?: string;
    date?: string;
    time?: string;
    title?: string;
  }>({});

  const meetingTypeOptions = [
    { value: 'face_to_face', label: 'Face-To-Face' },
    { value: 'online', label: 'Online' },
  ];

  // Validate meeting type is one of allowed values
  const isValidMeetingType = (type: string): boolean => {
    const validTypes = ['face_to_face', 'online'];
    return validTypes.includes(type);
  };

  // Fetch leads and attendees from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leads
        const leadsResponse = await listLeads(1, 100);
        const leadOpts = leadsResponse.data.map((leadItem: any) => ({
          value: String(leadItem.id),
          label: `${leadItem.name || leadItem.contact_person || `Lead ${leadItem.id}`} #${leadItem.id}`,
        }));
        setLeadOptions(leadOpts);

        // Fetch attendees
        const { data: usersData } = await listAttendees(1, 100);
        const attendeeOpts = usersData.map((user: any) => ({
          value: String(user.id),
          label: `${user.name || user.email || 'Unknown'} #${user.id}`,
        }));
        setAttendeesOptions(attendeeOpts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLeadOptions([]);
        setAttendeesOptions([]);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    // Validate required fields and set errors
    const newErrors: typeof errors = {};
    if (!lead) newErrors.lead = 'Lead is required.';
    if (!meetingType) newErrors.meetingType = 'Meeting type is required.';
    if (!attendees.length) newErrors.attendees = 'At least one attendee is required.';
    if (!date) newErrors.date = 'Date is required.';
    if (!time) newErrors.time = 'Time is required.';
    if (!title) newErrors.title = 'Title is required.';

    // Validate meeting type is one of allowed values
    if (meetingType && !isValidMeetingType(meetingType)) {
      newErrors.meetingType = 'Invalid meeting type. Please select either "Face-To-Face" or "Online".';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Do not proceed if there are errors
      return;
    }

    try {
      // Parse attendees - convert all to integers
      const attendeeIds = attendees
        .map((id: any) => {
          // Handle format like #USR001 or #001 by extracting the numeric part
          if (typeof id === 'string' && id.startsWith('#')) {
            const numericPart = id.replace(/[^0-9]/g, '');
            return Number(numericPart);
          }
          return Number(id);
        })
        .filter((id) => Number.isInteger(id) && id > 0);

      console.log('Raw attendees state:', attendees);
      console.log('Converted attendee IDs:', attendeeIds);

      // Prepare payload for API
      const payload = {
        title,
        lead_id: String(lead),
        attendees_id: attendeeIds,  // Array of integer IDs
        type: meetingType,
        location,
        agenda,
        link: meetLink,
        meeting_date: date ? date.toISOString().split('T')[0] : '',
        meeting_time: time ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}` : '',
        status: 1,
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      // Call the API service
      const response = await createMeeting(payload);
      console.log('Meeting created successfully', response);
      // Show success message
      showSuccess('Meeting scheduled successfully!');
      // Navigate back to lead management list
      navigate('/lead-management/all-leads');
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      showSuccess(`Error: ${error.message || 'Failed to save meeting'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-3">
        <Breadcrumb
          items={[
            { label: 'Lead Management', path: '/lead-management' },
            { label: 'Meeting Schedule', isActive: true },
          ]}
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="font-semibold px-3 py-1 rounded-md flex items-center text-sm btn-primary text-white"
        >
          <svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Go Back
        </button>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lead, Meeting Type, Attendees */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Lead <span className="text-[#FF0000]">*</span></label>
                <SelectField
                  placeholder="Select Lead"
                  options={leadOptions}
                  value={lead}
                  onChange={(v) => {
                    setLead(String(v));
                    if (errors.lead && v) setErrors({ ...errors, lead: undefined });
                  }}
                  inputClassName="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)]"
                />
                {errors.lead && <div className="text-red-500 text-xs mt-1">{errors.lead}</div>}
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Meeting Type <span className="text-[#FF0000]">*</span></label>
                <SelectField
                  placeholder="Select Type"
                  options={meetingTypeOptions}
                  value={meetingType}
                  onChange={(v) => {
                    setMeetingType(String(v));
                    if (errors.meetingType && v) setErrors({ ...errors, meetingType: undefined });
                  }}
                  inputClassName="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)]"
                />
                {errors.meetingType && <div className="text-red-500 text-xs mt-1">{errors.meetingType}</div>}
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Attendees <span className="text-[#FF0000]">*</span></label>
                    <MultiSelectDropdown
                      name="attendees"
                      value={attendees}
                      onChange={(v) => {
                        setAttendees(v);
                        if (errors.attendees && v.length) setErrors({ ...errors, attendees: undefined });
                      }}
                      options={attendeesOptions}
                      placeholder={attendeesOptions.length ? 'Search or select attendees' : 'Loading attendees...'}
                      multi={true}
                      horizontalScroll={true}
                    />
                    {errors.attendees && <div className="text-red-500 text-xs mt-1">{errors.attendees}</div>}
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Agenda</label>
                    <input
                      type="text"
                      placeholder="Meeting Agenda And Objective"
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      className="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>
              {/* Date and Time in one row (Date left, Time right) */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Date <span className="text-[#FF0000]">*</span></label>
                    <DatePicker
                      selected={date}
                      onChange={(d: Date | null) => {
                        setDate(d);
                        if (errors.date && d) setErrors({ ...errors, date: undefined });
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="yyyy-mm-dd"
                      className="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] w-full"
                      wrapperClassName="w-full"
                      popperPlacement="bottom-start"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      minDate={new Date()}
                    />
                    {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Time <span className="text-[#FF0000]">*</span></label>
                    <DatePicker
                      selected={time}
                      onChange={(t: Date | null) => {
                        setTime(t);
                        if (errors.time && t) setErrors({ ...errors, time: undefined });
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="HH:mm"
                      placeholderText="--:--"
                      className="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] w-full"
                      wrapperClassName="w-full"
                      popperPlacement="bottom-start"
                    />
                    {errors.time && <div className="text-red-500 text-xs mt-1">{errors.time}</div>}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Add Title <span className="text-[#FF0000]">*</span></label>
                <input
                  type="text"
                  placeholder="Meeting Agenda And Objective"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title && e.target.value) setErrors({ ...errors, title: undefined });
                  }}
                  className="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)]"
                />
                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
              </div>
              {/* Meeting Location and Agenda side by side */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Meeting Location</label>
                <input
                  type="text"
                  placeholder="In Office , out of Office. etc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Meet Link</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="border border-[var(--border-color)] focus:ring-blue-500 w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-6 py-2 btn-primary text-white rounded-lg shadow-sm"
                data-btn-label="Save"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingSchedule;
