import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterFormHeader } from '../../../components/ui';
import { ROUTES } from '../../../constants';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  created: string;
}

const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'Mayank Sharma',
    email: 'admin@gmail.com',
    phone: '+91-9876543210',
    role: 'S-Admin',
    status: 'Active',
    lastLogin: '7:32pm',
    created: '01/01/2024',
  },
  {
    id: 'USR002',
    name: 'Anuj',
    email: 'admin@gmail.com',
    phone: '+91-9876543211',
    role: 'Admin',
    status: 'Active',
    lastLogin: '7:32pm',
    created: '01/01/2024',
  },
  {
    id: 'USR003',
    name: 'Shivalika',
    email: 'bdm@gmail.com',
    phone: '+91-9876543212',
    role: 'BDM',
    status: 'Active',
    lastLogin: '7:32pm',
    created: '01/01/2024',
  },
  {
    id: 'USR004',
    name: 'Manraj',
    email: 'bdm@gmail.com',
    phone: '+91-9876543213',
    role: 'S-BDM',
    status: 'Active',
    lastLogin: '7:32pm',
    created: '01/01/2024',
  },
  {
    id: 'USR005',
    name: 'Olivia Rhye',
    email: 'planner@gmail.com',
    phone: '+91-9876543214',
    role: 'Planner',
    status: 'Inactive',
    lastLogin: '7:32pm',
    created: '01/01/2024',
  },
];

const ViewUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // Mock data for now
        const mockUser = mockUsers.find(u => u.id === id);
        setUser(mockUser || null);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const getStatusBadgeColor = (status: 'Active' | 'Inactive') => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColorMap: Record<string, string> = {
      'S-Admin': 'border-purple-300 text-purple-700 bg-purple-50',
      'Admin': 'border-blue-300 text-blue-700 bg-blue-50',
      'BDM': 'border-orange-300 text-orange-700 bg-orange-50',
      'S-BDM': 'border-yellow-300 text-yellow-700 bg-yellow-50',
      'Planner': 'border-pink-300 text-pink-700 bg-pink-50',
    };
    return roleColorMap[role] || 'border-gray-300 text-gray-700 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="text-lg text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <MasterFormHeader 
        onBack={() => navigate(ROUTES.USER.ROOT)} 
        title="View User" 
      />
      
      <div className="bg-white border border-[var(--border-color)] rounded-xl shadow-sm p-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">User Name</div>
              <div className="text-base text-[var(--text-primary)]">{user.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="text-base text-[var(--text-primary)]">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Phone Number</div>
              <div className="text-base text-[var(--text-primary)]">{user.phone}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Role</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center justify-center h-7 px-3 border rounded-full text-xs font-medium leading-tight whitespace-nowrap ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center justify-center h-7 px-3 border border-transparent rounded-full text-xs font-medium leading-tight whitespace-nowrap ${getStatusBadgeColor(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Last Login</div>
              <div className="text-base text-[var(--text-primary)]">{user.lastLogin}</div>
            </div>
          </div>

          <div className="col-span-2">
            <div>
              <div className="text-sm text-gray-600">Created Date</div>
              <div className="text-base text-[var(--text-primary)]">{user.created}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
