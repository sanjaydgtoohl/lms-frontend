import React, { useState, useEffect } from 'react';
import { /*Loader2,*/ } from 'lucide-react';
import { motion } from 'framer-motion';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
import Table, { type Column } from '../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MasterHeader, MasterFormHeader, NotificationPopup } from '../components/ui';
import SearchBar from '../components/ui/SearchBar';
import {
	listDepartments,
	createDepartment,
	updateDepartment,
	deleteDepartment,
	type Department as ApiDepartment,
} from '../services/DepartmentMaster';

interface Department {
	id: string;
	name: string;
	dateTime: string;
}

// Inline CreateDepartmentForm (keeps behavior local and matches BrandMaster usage)
const CreateDepartmentForm: React.FC<{
	onClose: () => void;
	onSave?: (data: any) => void;
}> = ({ onClose, onSave }) => {
	const [name, setName] = useState('');
	const [error, setError] = useState('');
	const [showSuccessToast, setShowSuccessToast] = useState(false);

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
			setShowSuccessToast(true);
			setTimeout(() => {
				setShowSuccessToast(false);
				onClose();
				window.location.reload();
			}, 5000);
		} catch (err) {
			// parent handles errors
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 8 }}
			transition={{ duration: 0.22 }}
			className="space-y-6"
		>
			<MasterFormHeader onBack={onClose} title="Create Department" />
			<NotificationPopup
				isOpen={showSuccessToast}
				onClose={() => setShowSuccessToast(false)}
				message="Department created successfully"
				type="success"
			/>
			<div className="w-full bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
				<div className="p-6 bg-[#F9FAFB]">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm text-[var(--text-secondary)] mb-1">Department Name <span className="text-red-500">*</span></label>
							<input
								name="departmentName"
								value={name}
								onChange={(e) => { setName(e.target.value); setError(''); }}
								className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
								placeholder="Please Enter Department Name"
							/>
							{error && <div className="text-xs text-red-500 mt-1">{error}</div>}
						</div>

						<div className="flex items-center justify-end">
							<button
								type="submit"
								className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
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
	const [showDeleteToast, setShowDeleteToast] = useState(false);

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
		// Create on server then refresh list
		(async () => {
			try {
				await createDepartment({ name: data.name });
				await refresh();
				setCurrentPage(1);
			} catch (e: any) {
				alert(e?.message || 'Failed to create department');
			}
		})();
	};

	const handleEdit = (id: string) => {
		navigate(`${ROUTES.DEPARTMENT_MASTER}/${encodeURIComponent(id)}/edit`);
	};

	const handleView = (id: string) => {
		navigate(`${ROUTES.DEPARTMENT_MASTER}/${encodeURIComponent(id)}`);
	};

	const handleDelete = async (id: string) => {
		const confirm = window.confirm('Delete this department?');
		if (!confirm) return;
		try {
			await deleteDepartment(id);
			setDepartments(prev => prev.filter(d => d.id !== id));
			setShowDeleteToast(true);
			setTimeout(() => setShowDeleteToast(false), 3000);
		} catch (e: any) {
			alert(e?.message || 'Failed to delete');
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
			const resp = await listDepartments(page, itemsPerPage);
			let mapped: Department[] = resp.data.map((it: ApiDepartment) => ({
				id: String(it.id),
				name: it.name,
				dateTime: it.created_at || '',
			}));

			// If search is present, filter client-side
			if (search) {
				const _q_dept = String(search).trim().toLowerCase();
				mapped = mapped.filter(d => (d.name || '').toLowerCase().startsWith(_q_dept));
				// When searching, set totalItems to filtered length
				setTotalItems(mapped.length);
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
			} catch (e: any) {
				alert(e?.message || 'Failed to update');
			}
		})();
	};

	return (
		<div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
			<NotificationPopup
				isOpen={showDeleteToast}
				onClose={() => setShowDeleteToast(false)}
				message="Department deleted successfully"
				type="success"
				customStyle={{
					bg: 'bg-gradient-to-r from-red-50 to-red-100',
					border: 'border-l-4 border-red-500',
					text: 'text-red-800',
					icon: 'text-red-500'
				}}
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
					/>
					{/* Desktop Table View */}
					<div className="hidden lg:block">
						<div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
								{/* Table Header */}
								<div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
									<div className="flex items-center justify-between">
										<h2 className="text-lg font-semibold text-[var(--text-primary)]">Department Master</h2>
										<SearchBar placeholder="Search Department" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); refresh(1, q); }} />
									</div>
								</div>

								{error && (
									<div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-[var(--border-color)]">{error}</div>
								)}

								<Table
										data={currentData}
										startIndex={startIndex}
										loading={loading}
										keyExtractor={(it: any, idx: number) => `${it.id}-${idx}`}
										columns={([
											{ key: 'sr', header: 'Sr. No.', render: (it: any) => String(startIndex + currentData.indexOf(it) + 1) },
											{ key: 'name', header: 'Department Name', render: (it: any) => it.name },
											{ key: 'dateTime', header: 'Date & Time', render: (it: any) => it.dateTime },
										] as Column<any>[])}
										onEdit={(it: any) => handleEdit(it.id)}
										onView={(it: any) => handleView(it.id)}
										onDelete={(it: any) => handleDelete(it.id)}
									/>
						</div>
					</div>

					{/* Mobile handled by Table component - removed duplicate mobile rendering */}

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

