import React, { useState, useEffect } from 'react';
import ActionMenu from '../components/ui/ActionMenu';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
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
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const [showCreate, setShowCreate] = useState(false);
	const navigate = useNavigate();
	const params = useParams();
	const location = useLocation();

	// apply instant prefix search (case-insensitive) on department name
	const _q_dept = String(searchQuery || '').trim().toLowerCase();
	const filtered = _q_dept ? departments.filter(d => (d.name || '').toLowerCase().startsWith(_q_dept)) : departments;

	// totalPages calculated but not used directly
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentData = filtered.slice(startIndex, endIndex);

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

	const refresh = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await listDepartments();
			const mapped: Department[] = (data as ApiDepartment[]).map((it) => ({
				id: String(it.id),
				name: it.name,
				dateTime: it.created_at || '',
			}));
			setDepartments(mapped);
		} catch (e: any) {
			setError(e?.message || 'Failed to load departments');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { refresh(); }, []);

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
									<SearchBar placeholder="Search Department" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
								</div>
							</div>

							{/* Table */}
							{loading ? (
								<div className="px-6 py-12 flex items-center justify-center">
									<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
								</div>
							) : (
							<div className="overflow-x-auto">
								<table className="w-full text-center">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">Sr. No.</th>
											<th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">Department Name</th>
											<th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">Date & Time</th>
											<th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">Action</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[var(--border-color)]">
										{currentData.map((item, index) => (
											<tr 
												key={`${item.id}-${index}`} 
												className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
											>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
													{item.name}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
													{item.dateTime}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm">
													<ActionMenu
														isLast={index >= currentData.length - 2}
														onEdit={() => handleEdit(item.id)}
														onView={() => handleView(item.id)}
														onDelete={() => handleDelete(item.id)}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							)}
						</div>
					</div>

					{/* Mobile Card View */}
					<div className="lg:hidden space-y-4">
						<div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-4">
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">Department Master</h2>
						</div>

						{loading ? (
							<div className="px-4 py-12 flex items-center justify-center">
								<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
							</div>
						) : (
							<>
								{currentData.map((item, index) => (
								<div 
									key={`${item.id}-${index}`}
									className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200"
								>
									<div className="flex justify-between items-start mb-3">
										<div className="flex gap-2">
											<span className="text-sm text-[var(--text-secondary)]">Sr. No.:</span>
											<span className="text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</span>
										</div>
										<ActionMenu
											isLast={index >= currentData.length - 2}
											onEdit={() => handleEdit(item.id)}
											onView={() => handleView(item.id)}
											onDelete={() => handleDelete(item.id)}
										/>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-sm text-[var(--text-secondary)]">Department Name:</span>
											<span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
											<span className="text-sm text-[var(--text-secondary)]">{item.dateTime}</span>
										</div>
									</div>
								</div>
								))}
							</>
						)}
					</div>

					{/* Pagination */}
					<Pagination
						currentPage={currentPage}
						totalItems={departments.length}
						itemsPerPage={itemsPerPage}
						onPageChange={handlePageChange}
					/>
				</>
			)}
		</div>
	);
};

export default DepartmentMaster;

