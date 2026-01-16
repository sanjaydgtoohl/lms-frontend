import React, { useState, useEffect } from 'react';
import { /*Loader2,*/ } from 'lucide-react';
import { motion } from 'framer-motion';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
import Table, { type Column } from '../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MasterHeader, MasterFormHeader } from '../components/ui';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SearchBar from '../components/ui/SearchBar';
import {
	listDepartments,
	createDepartment,
	updateDepartment,
	deleteDepartment,
	type Department as ApiDepartment,
} from '../services/DepartmentMaster';
import { showSuccess, showError } from '../utils/notifications';

interface Department {
	id: string;
	name: string;
	dateTime: string;
}

// Helpers to parse API date strings like "19-11-2025 10:35:57"
const parseApiDateToISO = (s?: string) => {
	if (!s) return '';
	const m = String(s).trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
	if (!m) return s;
	const [, dd, mm, yyyy, hh, min, sec] = m;
	return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec || '00'}`;
};

const formatDisplayDate = (s?: string) => {
	if (!s) return '-';
	try {
		const iso = parseApiDateToISO(s);
		const d = new Date(iso);
		if (isNaN(d.getTime())) return String(s);
		return d.toLocaleString();
	} catch {
		return String(s);
	}
};

// Inline CreateDepartmentForm (keeps behavior local and matches BrandMaster usage)
const CreateDepartmentForm: React.FC<{
	onClose: () => void;
	onSave?: (data: any) => void;
}> = ({ onClose, onSave }) => {
	const [name, setName] = useState('');
	const [error, setError] = useState('');

	const formatDateTime = (d: Date) => {
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = String(d.getHours()).padStart(2, '0');
		const min = String(d.getMinutes()).padStart(2, '0');
		return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setError('Department Name is required');
			return;
		}
		try {
			const res: any = onSave ? (onSave as any)({ name, dateTime: formatDateTime(new Date()) }) : null;
			if (res && typeof res.then === 'function') await res;
			showSuccess('Department created successfully');
			onClose();
		} catch (err: any) {
			const responseData = err?.responseData;
			if (responseData?.errors && typeof responseData.errors === 'object') {
				// Handle validation errors
				const nameErrors = responseData.errors.name;
				const errorMessage = Array.isArray(nameErrors) ? nameErrors[0] : String(nameErrors);
				setError(errorMessage);
				
				// Don't show popup for "already been taken" errors - only show on form field
				if (!errorMessage.toLowerCase().includes('already been taken')) {
					showError(errorMessage);
				}
			} else {
				// Show general error if not a validation error
				showError(err?.message || 'Failed to create department');
			}
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.22 }}
			className="space-y-6"
		>
		<MasterFormHeader onBack={onClose} title="Create Department" />
			<div className="w-full bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
				<div className="p-6 bg-[#F9FAFB]">
					<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">
							Department Name <span className="text-red-500">*</span>
						</label>
						<input
							name="departmentName"
							value={name}
							onChange={(e) => { setName(e.target.value); setError(''); }}
							className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
								error ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
							}`}
							placeholder="Please Enter Department Name"
							aria-invalid={error ? 'true' : 'false'}
							aria-describedby={error ? 'departmentName-error' : undefined}
						/>
						{error && (
							<div id="departmentName-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
								<svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
								{error}
							</div>
						)}
					</div>

						<div className="flex items-center justify-end">
							<button
								type="submit"
								className="px-4 py-2 rounded-lg btn-primary text-white shadow-sm"
							>
								Save
							</button>
						</div>
					</form>
				</div>
			</div>
		</motion.div>
	);
};

const DepartmentMaster: React.FC = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [confirmLoading, setConfirmLoading] = useState(false);

	// Store departments in state fetched from API
	const [departments, setDepartments] = useState<Department[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const [showCreate, setShowCreate] = useState(false);
	const navigate = useNavigate();
	const params = useParams();
	const location = useLocation();

	// Backend pagination - no client-side slicing
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentData = departments;

	const handleCreateDepartment = () => {
		navigate(`${ROUTES.DEPARTMENT_MASTER}/create`);
	};

	const handleSaveDepartment = (data: any) => {
		// Return the promise so the calling form can handle validation errors inline
		return (async () => {
			try {
				await createDepartment({ name: data.name });
				await refresh();
				setCurrentPage(1);
				showSuccess('Department created successfully');
			} catch (e: any) {
				// Rethrow so caller can decide whether to show a popup or render inline errors
				throw e;
			}
		})();
	};

	const handleEdit = (id: string) => {
		navigate(`${ROUTES.DEPARTMENT_MASTER}/${encodeURIComponent(id)}/edit`);
	};

	const handleView = (id: string) => {
		navigate(`${ROUTES.DEPARTMENT_MASTER}/${encodeURIComponent(id)}`);
	};

	const handleDelete = (id: string) => {
		setConfirmDeleteId(id);
	};

	const confirmDelete = async () => {
		if (!confirmDeleteId) return;
		setConfirmLoading(true);
		try {
			await deleteDepartment(confirmDeleteId);
			setDepartments(prev => prev.filter(d => d.id !== confirmDeleteId));
		} catch (e: any) {
			alert(e?.message || 'Failed to delete');
		} finally {
			setConfirmLoading(false);
			setConfirmDeleteId(null);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const [viewItem, setViewItem] = useState<Department | null>(null);
	const [editItem, setEditItem] = useState<Department | null>(null);

	const refresh = async (page = currentPage, search = searchQuery) => {
		setLoading(true);
		setError(null);
		try {
			// When searching, fetch all departments to search across the entire dataset
			const pageToFetch = search ? 1 : page;
			const perPageToFetch = search ? 1000 : itemsPerPage; // Fetch all when searching
			
			const resp = await listDepartments(pageToFetch, perPageToFetch);
			let mapped: Department[] = resp.data.map((it: ApiDepartment) => ({
				id: String(it.id),
				name: it.name,
				dateTime: it.created_at || '',
			}));

			// If search is present, filter client-side across all results
			if (search) {
				const _q_dept = String(search).trim().toLowerCase();
				mapped = mapped.filter(d => (d.name || '').toLowerCase().startsWith(_q_dept));
				setTotalItems(mapped.length);
				
				// Apply pagination to filtered results
				const startIdx = (page - 1) * itemsPerPage;
				const endIdx = startIdx + itemsPerPage;
				mapped = mapped.slice(startIdx, endIdx);
			} else {
				// When not searching, use server total or full length
				setTotalItems(resp.meta?.pagination?.total || mapped.length);
			}

			setDepartments(mapped);
		} catch (e: any) {
			setError(e?.message || 'Failed to load departments');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { refresh(currentPage, searchQuery); }, [currentPage, searchQuery]);

	useEffect(() => {
		const rawId = params.id;
		const id = rawId ? decodeURIComponent(rawId) : undefined;

		if (location.pathname.endsWith('/create')) {
			setShowCreate(true);
			setViewItem(null);
			setEditItem(null);
			return;
		}

		if (location.pathname.endsWith('/edit') && id) {
			const found = departments.find(d => d.id === id) || null;
			setEditItem(found);
			setViewItem(null);
			setShowCreate(false);
			return;
		}

		if (id) {
			const found = departments.find(d => d.id === id) || null;
			setViewItem(found);
			setShowCreate(false);
			setEditItem(null);
			return;
		}

		setShowCreate(false);
		setViewItem(null);
		setEditItem(null);
	}, [location.pathname, params.id, departments]);

	const handleSaveEditedDepartment = (updated: Record<string, any>) => {
		(async () => {
			try {
				await updateDepartment(updated.id, { name: updated.name });
				setDepartments(prev => prev.map(d => (d.id === updated.id ? { ...d, name: updated.name } as Department : d)));
				showSuccess('Department updated successfully');
			} catch (e: any) {
				showError(e?.message || 'Failed to update department');
			}
		})();
	};

	return (
		<div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
			<ConfirmDialog
				isOpen={!!confirmDeleteId}
				title="Delete this department?"
				message="This action will permanently remove the department. This cannot be undone."
				confirmLabel="Delete"
				cancelLabel="Cancel"
				loading={confirmLoading}
				onCancel={() => setConfirmDeleteId(null)}
				onConfirm={confirmDelete}
			/>
			{showCreate ? (
				<CreateDepartmentForm onClose={() => navigate(ROUTES.DEPARTMENT_MASTER)} onSave={handleSaveDepartment} />
					) : viewItem ? (
						<MasterView item={viewItem} onClose={() => navigate(ROUTES.DEPARTMENT_MASTER)} />
			) : editItem ? (
	<MasterEdit item={editItem} onClose={() => navigate(ROUTES.DEPARTMENT_MASTER)} onSave={handleSaveEditedDepartment} hideSource nameLabel="Department" />
			) : (
				<>
					<MasterHeader
						onCreateClick={handleCreateDepartment}
						createButtonLabel="Create Department"
						showBreadcrumb={true}
					/>
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
						{/* Table Header */}
						<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-base font-semibold text-gray-900">Department Master</h2>
								<SearchBar 
									placeholder="Search Department" 
									delay={300}
									onSearch={(q: string) => { 
										setSearchQuery(q); 
										setCurrentPage(1); 
										refresh(1, q); 
									}} 
								/>
							</div>
						</div>

						{error && (
							<div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100 flex items-center gap-2">
								<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
								{error}
							</div>
						)}

												<div className="pt-0 overflow-visible">
						<Table
						data={currentData}
						startIndex={startIndex}
						loading={loading}
						desktopOnMobile={true}
						keyExtractor={(it: any, idx: number) => `${it.id}-${idx}`}
						columns={([
								{ key: 'sr', header: 'Sr. No.', render: (it: any) => String(startIndex + currentData.indexOf(it) + 1) },
								{ key: 'name', header: 'Department Name', render: (it: any) => it.name || '-' },
									{ key: 'dateTime', header: 'Date & Time', render: (it: any) => it.dateTime ? formatDisplayDate(it.dateTime) : '-' },
							] as Column<any>[])}
							onEdit={(it: any) => handleEdit(it.id)}
							onView={(it: any) => handleView(it.id)}
							onDelete={(it: any) => handleDelete(it.id)}
						/>
						</div>
					</div>

					{/* Pagination */}
					<Pagination
						currentPage={currentPage}
						totalItems={totalItems}
						itemsPerPage={itemsPerPage}
						onPageChange={handlePageChange}
					/>
				</>
			)}
		</div>
	);
};

export default DepartmentMaster;

