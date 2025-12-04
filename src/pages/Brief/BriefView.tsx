import React from 'react';

interface Person {
  id?: number;
  name?: string;
  email?: string;
}

interface Lookup {
  id?: number;
  name?: string;
}

interface BriefShape {
  id?: number;
  uuid?: string;
  name?: string;
  product_name?: string;
  mode_of_campaign?: string;
  media_type?: string;
  budget?: string | number;
  comment?: string;
  submission_date?: string;
  brief_status?: Lookup;
  priority?: Lookup;
  contact_person?: Person;
  brand?: Lookup;
  agency?: Lookup;
  assigned_user?: Person;
  created_by_user?: Person;
  created_at?: string;
  updated_at?: string;
}

interface BriefViewProps {
  brief: BriefShape;
  onClose?: () => void;
  onEdit?: (id?: number) => void;
}

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const formatCurrency = (val?: string | number) => {
  if (val == null || val === '') return '-';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/,/g, ''));
  if (Number.isNaN(num)) return String(val);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
};

const Badge: React.FC<{ children?: React.ReactNode; color?: string }> = ({ children, color = 'bg-gray-100 text-gray-800' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

const BriefView: React.FC<BriefViewProps> = ({ brief, onClose, onEdit }) => {
  if (!brief) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{brief.name ?? brief.product_name ?? 'Untitled Brief'}</h3>
          <div className="mt-2 flex items-center gap-2">
            <Badge color="bg-indigo-50 text-indigo-700">{brief.brief_status?.name ?? 'Status unknown'}</Badge>
            <Badge color="bg-yellow-50 text-yellow-800">{brief.priority?.name ?? 'Priority'}</Badge>
            <div className="text-sm text-gray-500">Submitted {formatDate(brief.submission_date)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(brief.id)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-transparent rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-300 flex items-center justify-center text-white text-xl font-semibold">
              {brief.name ? brief.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <div className="text-sm text-gray-500">Product</div>
              <div className="text-base font-medium text-[var(--text-primary)]">{brief.product_name ?? '-'}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-500">Mode of Campaign</div>
              <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.mode_of_campaign ?? '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-500">Media Type</div>
              <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.media_type ?? '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-500">Estimated Budget</div>
              <div className="mt-1 text-sm text-[var(--text-primary)]">{formatCurrency(brief.budget)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-500">Reference ID</div>
              <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.uuid ?? brief.id ?? '-'}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-500">Brief Notes</div>
            <div className="mt-2 p-4 bg-white border border-gray-100 rounded-md text-sm text-[var(--text-primary)] whitespace-pre-wrap">{brief.comment ?? '-'}</div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="p-4 bg-white border border-gray-100 rounded-md">
            <div className="text-xs text-gray-500">Contact Person</div>
            <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">{brief.contact_person?.name ?? '-'}</div>
            <div className="text-xs text-gray-500">{brief.contact_person?.email ?? ''}</div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-md">
            <div className="text-xs text-gray-500">Brand</div>
            <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.brand?.name ?? '-'}</div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-md">
            <div className="text-xs text-gray-500">Agency</div>
            <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.agency?.name ?? '-'}</div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-md">
            <div className="text-xs text-gray-500">Assigned To</div>
            <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.assigned_user?.name ?? '-'}</div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-md text-xs text-gray-500">
            <div>Created By</div>
            <div className="mt-1 text-sm text-[var(--text-primary)]">{brief.created_by_user?.name ?? '-'}</div>
            <div className="mt-1">{formatDate(brief.created_at)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BriefView;
