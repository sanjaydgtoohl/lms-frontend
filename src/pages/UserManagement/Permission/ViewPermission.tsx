import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterFormHeader } from '../../../components/ui';
import { ROUTES } from '../../../constants';

interface Permission {
  id: string;
  name: string;
  description: string;
}

const mockPermissions: Permission[] = [
  { id: '#PM001', name: 'User Read', description: 'Allows viewing user information and profiles' },
  { id: '#PM002', name: 'User Create', description: 'Allows creating new user accounts' },
  { id: '#PM003', name: 'User Update', description: 'Allows updating user information' },
  { id: '#PM004', name: 'User Delete', description: 'Allows deleting user accounts' },
  { id: '#PM005', name: 'Profile Read', description: 'Allows viewing user profile details' },
  { id: '#PM006', name: 'Permission Read', description: 'Allows viewing permission information' },
  { id: '#PM007', name: 'Permission Create', description: 'Allows creating new permissions' },
  { id: '#PM008', name: 'Permission Update', description: 'Allows updating permissions' },
  { id: '#PM009', name: 'Permission Delete', description: 'Allows deleting permissions' },
  { id: '#PM010', name: 'Role Read', description: 'Allows viewing role information' },
];

const ViewPermission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<Permission | null>(null);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // Mock data for now
        const permissionId = `#${id}`;
        const mockPermission = mockPermissions.find(p => p.id === permissionId);
        setPermission(mockPermission || null);
      } catch (error) {
        console.error('Error fetching permission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPermission();
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

  if (!permission) {
    return (
      <div className="flex-1 p-6">
        <div className="text-lg text-gray-500">Permission not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <MasterFormHeader 
        onBack={() => navigate(ROUTES.PERMISSION.ROOT)} 
        title="View Permission" 
      />
      
      <div className="bg-white border border-[var(--border-color)] rounded-xl shadow-sm p-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">ID</div>
              <div className="text-base text-[var(--text-primary)]">{permission.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Permission Name</div>
              <div className="text-base text-[var(--text-primary)]">{permission.name}</div>
            </div>
          </div>

          <div className="col-span-2">
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="text-base text-[var(--text-primary)] whitespace-pre-wrap">{permission.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPermission;
