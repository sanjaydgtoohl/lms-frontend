import React, { useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import SelectField from '../../components/ui/SelectField';

const MeetingSchedule: React.FC = () => {
  const navigate = useNavigate();

  const [meetingType, setMeetingType] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('');
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
              <SelectField
                placeholder="Select Attendees"
                options={attendeesOptions}
                value={attendees}
                onChange={(v) => setAttendees(String(v))}
                inputClassName="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 11H9V13H7V11Z" fill="currentColor" />
                    <path d="M11 11H13V13H11V11Z" fill="currentColor" />
                    <path d="M15 11H17V13H15V11Z" fill="currentColor" />
                    <path d="M7 15H9V17H7V15Z" fill="currentColor" />
                    <path d="M11 15H13V17H11V15Z" fill="currentColor" />
                    <path d="M15 15H17V17H15V15Z" fill="currentColor" />
                    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor" />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Time</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="--:--"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L14.5 13.75L15.25 12.48L13 11.25V8H12Z" fill="currentColor" />
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" />
                  </svg>
                </span>
              </div>
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
