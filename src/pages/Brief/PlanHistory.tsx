import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MasterHeader from '../../components/ui/MasterHeader';
import MasterFormHeader from '../../components/ui/MasterFormHeader';
import { getBriefById } from '../../services/PlanSubmission';
import type { BriefDetail } from '../../services/PlanSubmission';
import { fetchPlannerHistories } from '../../services/PlanHistory';
import type { PlannerHistoryItem } from '../../services/PlanHistory';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// No mock data, will fetch from API

const PlanHistory: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [submittedPlans, setSubmittedPlans] = useState<PlannerHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBriefById(Number(id))
      .then((data) => setBrief(data))
      .catch(() => {/* ignore error for now */});
    fetchPlannerHistories(Number(id))
      .then((data) => {
        console.log('Fetched planner histories:', data);
        setSubmittedPlans(data);
      })
      .catch(() => setSubmittedPlans([]))
      .finally(() => setLoading(false));
  }, [id]);

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
                <div>
                  <span className="text-gray-500">Brief ID:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief ? `#${brief.id}` : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Brief Name:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Sales Person:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.assigned_user?.name || '-'}</span>
                </div>
                {/* Source field removed: not present in BriefDetail */}
                <div>
                  <span className="text-gray-500">Brief Status:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.brief_status?.name || brief?.status || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.budget || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Brief Submission Date & Time:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.submission_date || '-'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Brand Name:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.brand?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Product Name:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.product_name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Media:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.mode_of_campaign || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Media Type:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.media_type || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.priority?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Brief Detail:</span>
                  <span className="font-medium text-gray-900 ml-2">{brief?.comment || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-700 mb-4">Submitted Plans</h3>

          <SubmittedPlansList plans={submittedPlans} loading={loading} />
        </div>
      </div>
    </>
  );
};


interface SubmittedPlansListProps {
  plans: PlannerHistoryItem[];
  loading?: boolean;
}

const SubmittedPlansList: React.FC<SubmittedPlansListProps> = ({ plans = [], loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(plans.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const paginated = plans.slice(startIndex, startIndex + pageSize);

  const gotoPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading submitted plans...</div>;
  }

  if (!plans.length) {
    return <div className="text-center py-8 text-gray-500">No submitted plans found.</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {paginated.map((plan, idx) => {
          // Use created_at as submission date, and show planner/creator
          const d = new Date(plan.created_at);
          const date = d.toLocaleDateString('en-GB');
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Attachments: submitted_plan (array), backup_plan (object)
          const attachments = [
            ...plan.submitted_plan.map((file, i) => ({
              type: file.name.toLowerCase().endsWith('.xlsx') ? 'xls' : file.name.toLowerCase().endsWith('.pptx') ? 'ppt' : 'file',
              label: (i + 1).toString(),
              url: file.url,
              name: file.name
            })),
            ...(plan.backup_plan ? [{
              type: plan.backup_plan.name.toLowerCase().endsWith('.xlsx') ? 'xls' : plan.backup_plan.name.toLowerCase().endsWith('.pptx') ? 'ppt' : 'file',
              label: 'Back-Up',
              url: plan.backup_plan.url,
              name: plan.backup_plan.name
            }] : [])
          ];

          return (
            <div key={plan.id} className="bg-gray-50 rounded-md shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Submitted Plan: <span className="font-semibold text-gray-800">{startIndex + idx + 1}</span></p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="text-xs text-gray-500">Plan ID</div>
                      <div className="mt-1">
                        <span className="text-sm text-blue-600">#{plan.id}</span>
                      </div>

                      <div className="text-xs text-gray-500 mt-3">Detail</div>
                      <div className="mt-1 text-sm text-gray-700">{plan.brief?.name || '-'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Plan Submitted Date & Time</div>
                      <div className="mt-1 text-sm text-gray-700">{date} {time}</div>

                      <div className="text-xs text-gray-500 mt-3">Submitted By</div>
                      <div className="mt-1 text-sm">
                        <span className="text-blue-600">{plan.creator?.name || '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-6">
                      <div className="flex items-center space-x-6">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              <div className={`w-12 h-14 rounded border flex items-center justify-center ${att.type === 'xls' ? 'bg-green-50 border-green-200' : att.type === 'ppt' ? 'bg-red-50 border-red-200' : 'bg-gray-100 border-gray-200'}`}>
                                <div className="text-xs font-semibold" style={{ color: att.type === 'xls' ? '#15803d' : att.type === 'ppt' ? '#b91c1c' : '#333' }}>{att.type.toUpperCase()}</div>
                              </div>
                            </a>
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