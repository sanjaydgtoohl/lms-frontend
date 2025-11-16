import React, { useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import SelectField from '../../components/ui/SelectField';
import MultiSelectDropdown from '../../components/ui/MultiSelectDropdown';

const MeetingSchedule: React.FC = () => {
  const navigate = useNavigate();

  const [meetingType, setMeetingType] = useState<string>('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [meetLink, setMeetLink] = useState<string>('');

  const meetingTypeOptions = [
    { value: 'face_to_face', label: 'Face-To-Face' },
    { value: 'online', label: 'Online' },
  ];

  const attendeesOptions = [
    { value: 'our_team', label: 'Our Team' },
    { value: 'client_team', label: 'Client Team' },
  ];

  const handleSave = () => {
    // TODO: hook up to API
    console.log('Meeting saved', { meetingType, attendees, date, time, title, agenda, location, meetLink });
    // Navigate back to lead management list
    navigate('/lead-management');
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
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
          className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg"
        >
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
        <div className="p-6 bg-[#F9FAFB]">
          <h3 className="text-base font-semibold text-[#344054] mb-4">Meeting Schedule</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Meeting Type</label>
              <SelectField
                placeholder="Select Type"
                options={meetingTypeOptions}
                value={meetingType}
                onChange={(v) => setMeetingType(String(v))}
                inputClassName="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Attendees</label>
              <MultiSelectDropdown
                options={attendeesOptions}
                value={attendees}
                onChange={(vals) => setAttendees(vals)}
                placeholder="Select Attendees"
                inputClassName="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Add Title</label>
              <input
                type="text"
                placeholder="Meeting Agenda And Objective"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Meeting Location</label>
              <input
                type="text"
                placeholder="In Office , out of Office. etc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Agenda</label>
              <input
                type="text"
                placeholder="Meeting Agenda And Objective"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Meet Link</label>
              <input
                type="text"
                placeholder="Optional"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 btn-primary text-white rounded-lg shadow-sm"
              data-btn-label="Save"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSchedule;
