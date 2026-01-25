import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MasterHeader from '../../components/ui/MasterHeader';
import MasterFormHeader from '../../components/ui/MasterFormHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for Submitted Plans listing
interface SubmittedPlan {
  planNumber: number;
  planId: string;
  detail: string;
  submittedAt: string;
  submittedBy: string;
  attachments: { type: 'xls' | 'ppt'; label: string }[];
}

const mockSubmittedPlans: SubmittedPlan[] = [
  {
    planNumber: 1,
    planId: '#CM9801',
    detail: 'Brand awareness for new Phone collection',
    submittedAt: '2025-07-02T22:23:00Z',
    submittedBy: 'Planner 1',
    attachments: [
      { type: 'xls', label: '1' },
      { type: 'ppt', label: '2' },
      { type: 'xls', label: 'Back-Up' }
    ]
  },
  {
    planNumber: 2,
    planId: '#CM9802',
    detail: 'Lead generation campaign for Q3',
    submittedAt: '2025-07-02T22:23:00Z',
    submittedBy: 'Planner 2',
    attachments: [
      { type: 'xls', label: '1' },
      { type: 'ppt', label: '2' },
      { type: 'xls', label: 'Back-Up' }
    ]
  },
  {
    planNumber: 3,
    planId: '#CM9803',
    detail: 'Seasonal promo for accessories line',
    submittedAt: '2025-07-02T22:23:00Z',
    submittedBy: 'Planner 3',
    attachments: [
      { type: 'xls', label: '1' },
      { type: 'ppt', label: '2' },
      { type: 'xls', label: 'Back-Up' }
    ]
  },
  {
    planNumber: 4,
    planId: '#CM9804',
    detail: 'Brand awareness for new Phone collection',
    submittedAt: '2025-07-02T22:23:00Z',
    submittedBy: 'Planner 1',
    attachments: [
      { type: 'xls', label: '1' },
      { type: 'ppt', label: '2' },
      { type: 'xls', label: 'Back-Up' }
    ]
  },
  {
    planNumber: 5,
    planId: '#CM9805',
    detail: 'Channel testing and optimization plan',
    submittedAt: '2025-07-02T22:23:00Z',
    submittedBy: 'Planner 4',
    attachments: [
      { type: 'xls', label: '1' },
      { type: 'ppt', label: '2' },
      { type: 'xls', label: 'Back-Up' }
    ]
  }
];

const PlanHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const leftColumn = [
    { label: 'Brief ID', value: '#CM9801' },
    { label: 'Sales Person', value: 'Aryan Sharma' },
    { label: 'Source', value: 'Newspaper' },
    { label: 'Brief Status', value: 'Submission' },
    { label: 'Budget', value: '450000' },
    { label: 'Brief Submission Date & Time', value: '02-07-2025 22:23' },
  ];

  const rightColumn = [
    { label: 'Brand Name', value: 'Apple' },
    { label: 'Product Name', value: 'iPhone' },
    { label: 'Media', value: 'Programmatic' },
    { label: 'Media Type', value: 'DOOH' },
    { label: 'Priority', value: 'High' },
    { label: 'Brief Detail', value: 'According to format' },
  ];

  return (
    <>
      <MasterFormHeader onBack={() => navigate(-1)} title="Plan History" />

      <MasterHeader
        showBreadcrumb={false}
        breadcrumbItems={[
          { label: 'Brief', path: '/brief' },
          { label: 'Plan History', isActive: true }
        ]}
        showCreateButton={false}
        onCreateClick={() => {}}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-6 py-4 flex items-center border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {id ? `Plan History - Brief #${id}` : 'Plan History'}
          </h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Brief Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                {leftColumn.map((item, index) => (
                  <div key={index}>
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-medium text-gray-900 ml-2">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {rightColumn.map((item, index) => (
                  <div key={index}>
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-medium text-gray-900 ml-2">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-700 mb-4">Submitted Plans</h3>

          <SubmittedPlansList />
        </div>
      </div>
    </>
  );
};

// SubmittedPlansList component (kept in same file for simplicity)
const SubmittedPlansList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(mockSubmittedPlans.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const paginated = mockSubmittedPlans.slice(startIndex, startIndex + pageSize);

  const gotoPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <>
      <div className="space-y-4">
        {paginated.map((plan) => {
          const d = new Date(plan.submittedAt);
          const date = d.toLocaleDateString('en-GB');
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={plan.planNumber} className="bg-gray-50 rounded-md shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Submitted Plan: <span className="font-semibold text-gray-800">{plan.planNumber}</span></p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="text-xs text-gray-500">Plan ID</div>
                      <div className="mt-1">
                        <a href="#" className="text-sm text-blue-600 hover:underline">{plan.planId}</a>
                      </div>

                      <div className="text-xs text-gray-500 mt-3">Detail</div>
                      <div className="mt-1 text-sm text-gray-700">{plan.detail}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Plan Submitted Date & Time</div>
                      <div className="mt-1 text-sm text-gray-700">{date} {time}</div>

                      <div className="text-xs text-gray-500 mt-3">Submitted By</div>
                      <div className="mt-1 text-sm">
                        <a href="#" className="text-blue-600 hover:underline">{plan.submittedBy}</a>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-6">
                      <div className="flex items-center space-x-6">
                        {plan.attachments.map((att, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className={`w-12 h-14 rounded border flex items-center justify-center ${att.type === 'xls' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                              <div className="text-xs font-semibold" style={{ color: att.type === 'xls' ? '#15803d' : '#b91c1c' }}>{att.type.toUpperCase()}</div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{att.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end items-center space-x-3">
        <button onClick={() => gotoPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const isActive = p === currentPage;
            return (
              <button key={p} onClick={() => gotoPage(p)} className={`px-3 py-1 rounded ${isActive ? 'text-purple-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}>
                {p}
              </button>
            );
          })}
        </div>

        <button onClick={() => gotoPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-gray-400 hover:text-gray-600">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export default PlanHistory;