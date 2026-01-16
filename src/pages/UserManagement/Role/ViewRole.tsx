
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterFormHeader } from '../../../components/ui';
import { ROUTES } from '../../../constants';
import { getRoleById } from '../../../services/ViewRole';

interface Role {
  id: string | number;
  name: string;
  description: string;
}

const ViewRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setIsLoading(true);
        if (id) {
          // Ensure only the numeric ID is sent to the API
          const numericId = id.replace(/[^\d]/g, '');
          const data = await getRoleById(numericId);
          // Type assertion for data
          const roleData = data as { id: string; name: string; description?: string };
          setRole({
            id: roleData.id,
            name: roleData.name,
            description: roleData.description || '',
          });
        }
      } catch (error) {
        setRole(null);
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
