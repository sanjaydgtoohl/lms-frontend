import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterFormHeader } from '../../../components/ui';
import { ROUTES } from '../../../constants';

interface Role {
  id: string;
  name: string;
  description: string;
}

const mockRoles: Role[] = [
  { id: '#RL001', name: 'Admin', description: 'Full system access with all permissions and settings control' },
  { id: '#RL002', name: 'BDM', description: 'Business Development Manager with lead and campaign management access' },
  { id: '#RL003', name: 'Manager', description: 'Manager with team oversight and reporting access' },
  { id: '#RL004', name: 'User', description: 'Standard user with basic access to assigned features' },
  { id: '#RL005', name: 'Super Admin', description: 'Super Administrator with system-wide control and user management access' },
];

const ViewRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // Mock data for now
        const roleId = `#${id}`;
        const mockRole = mockRoles.find(r => r.id === roleId);
        setRole(mockRole || null);
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRole();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex-1 p-6">
        <div className="text-lg text-gray-500">Role not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <MasterFormHeader 
        onBack={() => navigate(ROUTES.ROLE.ROOT)} 
        title="View Role" 
      />
      
      <div className="bg-white border border-[var(--border-color)] rounded-xl shadow-sm p-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">ID</div>
              <div className="text-base text-[var(--text-primary)]">{role.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Role Name</div>
              <div className="text-base text-[var(--text-primary)]">{role.name}</div>
            </div>
          </div>

          <div className="col-span-2">
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="text-base text-[var(--text-primary)] whitespace-pre-wrap">{role.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRole;
