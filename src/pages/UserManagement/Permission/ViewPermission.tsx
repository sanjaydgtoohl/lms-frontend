
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MasterFormHeader, PermissionDenied } from '../../../components/ui';
import { ROUTES } from '../../../constants';
import { getPermission } from '../../../services/AllPermissions';

interface Permission {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
}

const ViewPermission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<Permission | null>(null);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const data = await getPermission(id);
          setPermission(data);
        } else {
          setPermission(null);
        }
      } catch (error) {
        console.error('Error fetching permission:', error);
        setPermission(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermission();
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
    return <PermissionDenied />;
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
              <div className="text-base text-[var(--text-primary)]">{permission.display_name}</div>
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
