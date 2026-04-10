
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
    <div className="flex-1">
      <MasterFormHeader
        onBack={() => navigate(ROUTES.PERMISSION.ROOT)}
        title="View Permission"
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className='flex gap-x-3 gap-y-1 items-center flex-wrap bg-gray-50 border border-gray-200 rounded-lg py-3 px-3'>
            <div className="text-sm text-gray-800 font-semibold">ID : </div>
            <div className="text-sm text-gray-600">{permission.id}</div>
          </div>

         <div className='flex gap-x-3 gap-y-1 items-center flex-wrap bg-gray-50 border border-gray-200 rounded-lg py-3 px-3'>
            <div className="text-sm text-gray-800 font-semibold">Permission Name : </div>
            <div className="text-sm text-gray-600">{permission.display_name}</div>
          </div>

          <div className='flex gap-x-3 gap-y-1 items-center flex-wrap bg-gray-50 border border-gray-200 rounded-lg py-3 px-3'>
            <div className="text-sm text-gray-800 font-semibold">Description : </div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{permission.description}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewPermission;
