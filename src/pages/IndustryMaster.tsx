import React, { useState } from 'react';
import { Edit, Plus, ChevronLeft, ChevronRight, Eye, Trash } from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  dateTime: string;
}

const IndustryMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data as requested
  const industries: Industry[] = [
    { id: '#CMP801', name: 'Industry 1', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Industry 2', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Industry 3', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Industry 4', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Industry 5', dateTime: '02-07-2025 22:23' },
    // Adding more sample data for pagination demonstration
    { id: '#CMP802', name: 'Technology', dateTime: '02-07-2025 22:24' },
    { id: '#CMP803', name: 'Healthcare', dateTime: '02-07-2025 22:25' },
    { id: '#CMP804', name: 'Finance', dateTime: '02-07-2025 22:26' },
    { id: '#CMP805', name: 'Education', dateTime: '02-07-2025 22:27' },
    { id: '#CMP806', name: 'Manufacturing', dateTime: '02-07-2025 22:28' },
    { id: '#CMP807', name: 'Retail', dateTime: '02-07-2025 22:29' },
    { id: '#CMP808', name: 'Real Estate', dateTime: '02-07-2025 22:30' },
    { id: '#CMP809', name: 'Automotive', dateTime: '02-07-2025 22:31' },
    { id: '#CMP810', name: 'Energy', dateTime: '02-07-2025 22:32' },
    { id: '#CMP811', name: 'Telecommunications', dateTime: '02-07-2025 22:33' },
    { id: '#CMP812', name: 'Media & Entertainment', dateTime: '02-07-2025 22:34' },
    { id: '#CMP813', name: 'Transportation', dateTime: '02-07-2025 22:35' },
    { id: '#CMP814', name: 'Agriculture', dateTime: '02-07-2025 22:36' },
    { id: '#CMP815', name: 'Construction', dateTime: '02-07-2025 22:37' },
    { id: '#CMP816', name: 'Hospitality', dateTime: '02-07-2025 22:38' },
    { id: '#CMP817', name: 'Logistics', dateTime: '02-07-2025 22:39' },
    { id: '#CMP818', name: 'Consulting', dateTime: '02-07-2025 22:40' },
    { id: '#CMP819', name: 'Legal Services', dateTime: '02-07-2025 22:41' },
    { id: '#CMP820', name: 'Insurance', dateTime: '02-07-2025 22:42' },
    { id: '#CMP821', name: 'Pharmaceuticals', dateTime: '02-07-2025 22:43' },
    { id: '#CMP822', name: 'Food & Beverage', dateTime: '02-07-2025 22:44' },
    { id: '#CMP823', name: 'Fashion', dateTime: '02-07-2025 22:45' },
    { id: '#CMP824', name: 'Sports', dateTime: '02-07-2025 22:46' },
    { id: '#CMP825', name: 'Non-Profit', dateTime: '02-07-2025 22:47' },
    { id: '#CMP826', name: 'Government', dateTime: '02-07-2025 22:48' },
    { id: '#CMP827', name: 'Military', dateTime: '02-07-2025 22:49' },
    { id: '#CMP828', name: 'Security', dateTime: '02-07-2025 22:50' },
    { id: '#CMP829', name: 'Environmental', dateTime: '02-07-2025 22:51' },
    { id: '#CMP830', name: 'Research', dateTime: '02-07-2025 22:52' },
    { id: '#CMP831', name: 'Software', dateTime: '02-07-2025 22:53' },
    { id: '#CMP832', name: 'Hardware', dateTime: '02-07-2025 22:54' },
    { id: '#CMP833', name: 'E-commerce', dateTime: '02-07-2025 22:55' },
    { id: '#CMP834', name: 'Gaming', dateTime: '02-07-2025 22:56' },
    { id: '#CMP835', name: 'Social Media', dateTime: '02-07-2025 22:57' },
    { id: '#CMP836', name: 'Cryptocurrency', dateTime: '02-07-2025 22:58' },
    { id: '#CMP837', name: 'Blockchain', dateTime: '02-07-2025 22:59' },
    { id: '#CMP838', name: 'Artificial Intelligence', dateTime: '02-07-2025 23:00' },
    { id: '#CMP839', name: 'Machine Learning', dateTime: '02-07-2025 23:01' },
    { id: '#CMP840', name: 'Data Science', dateTime: '02-07-2025 23:02' },
    { id: '#CMP841', name: 'Cloud Computing', dateTime: '02-07-2025 23:03' },
    { id: '#CMP842', name: 'Cybersecurity', dateTime: '02-07-2025 23:04' },
    { id: '#CMP843', name: 'IoT', dateTime: '02-07-2025 23:05' },
    { id: '#CMP844', name: 'Robotics', dateTime: '02-07-2025 23:06' },
    { id: '#CMP845', name: 'Biotechnology', dateTime: '02-07-2025 23:07' },
    { id: '#CMP846', name: 'Nanotechnology', dateTime: '02-07-2025 23:08' },
    { id: '#CMP847', name: 'Space Technology', dateTime: '02-07-2025 23:09' },
    { id: '#CMP848', name: 'Renewable Energy', dateTime: '02-07-2025 23:10' },
    { id: '#CMP849', name: 'Clean Technology', dateTime: '02-07-2025 23:11' },
    { id: '#CMP850', name: 'Green Technology', dateTime: '02-07-2025 23:12' },
    { id: '#CMP851', name: 'Fintech', dateTime: '02-07-2025 23:13' },
    { id: '#CMP852', name: 'Healthtech', dateTime: '02-07-2025 23:14' },
    { id: '#CMP853', name: 'Edtech', dateTime: '02-07-2025 23:15' },
    { id: '#CMP854', name: 'Proptech', dateTime: '02-07-2025 23:16' },
    { id: '#CMP855', name: 'Agtech', dateTime: '02-07-2025 23:17' },
    { id: '#CMP856', name: 'Legaltech', dateTime: '02-07-2025 23:18' },
    { id: '#CMP857', name: 'Regtech', dateTime: '02-07-2025 23:19' },
    { id: '#CMP858', name: 'Insurtech', dateTime: '02-07-2025 23:20' },
    { id: '#CMP859', name: 'Martech', dateTime: '02-07-2025 23:21' },
    { id: '#CMP860', name: 'Adtech', dateTime: '02-07-2025 23:22' },
    { id: '#CMP861', name: 'HRtech', dateTime: '02-07-2025 23:23' },
    { id: '#CMP862', name: 'Recruitment', dateTime: '02-07-2025 23:24' },
    { id: '#CMP863', name: 'Training', dateTime: '02-07-2025 23:25' },
    { id: '#CMP864', name: 'Development', dateTime: '02-07-2025 23:26' },
    { id: '#CMP865', name: 'Outsourcing', dateTime: '02-07-2025 23:27' },
    { id: '#CMP866', name: 'Freelancing', dateTime: '02-07-2025 23:28' },
    { id: '#CMP867', name: 'Gig Economy', dateTime: '02-07-2025 23:29' },
    { id: '#CMP868', name: 'Sharing Economy', dateTime: '02-07-2025 23:30' },
    { id: '#CMP869', name: 'Circular Economy', dateTime: '02-07-2025 23:31' },
    { id: '#CMP870', name: 'Digital Economy', dateTime: '02-07-2025 23:32' },
    { id: '#CMP871', name: 'Platform Economy', dateTime: '02-07-2025 23:33' },
    { id: '#CMP872', name: 'Creator Economy', dateTime: '02-07-2025 23:34' },
    { id: '#CMP873', name: 'Subscription Economy', dateTime: '02-07-2025 23:35' },
    { id: '#CMP874', name: 'Experience Economy', dateTime: '02-07-2025 23:36' },
    { id: '#CMP875', name: 'Attention Economy', dateTime: '02-07-2025 23:37' },
    { id: '#CMP876', name: 'Data Economy', dateTime: '02-07-2025 23:38' },
    { id: '#CMP877', name: 'API Economy', dateTime: '02-07-2025 23:39' },
    { id: '#CMP878', name: 'Microservices', dateTime: '02-07-2025 23:40' },
    { id: '#CMP879', name: 'Serverless', dateTime: '02-07-2025 23:41' },
    { id: '#CMP880', name: 'Edge Computing', dateTime: '02-07-2025 23:42' },
    { id: '#CMP881', name: 'Quantum Computing', dateTime: '02-07-2025 23:43' },
    { id: '#CMP882', name: 'Neuromorphic Computing', dateTime: '02-07-2025 23:44' },
    { id: '#CMP883', name: 'Optical Computing', dateTime: '02-07-2025 23:45' },
    { id: '#CMP884', name: 'DNA Computing', dateTime: '02-07-2025 23:46' },
    { id: '#CMP885', name: 'Molecular Computing', dateTime: '02-07-2025 23:47' },
    { id: '#CMP886', name: 'Chemical Computing', dateTime: '02-07-2025 23:48' },
    { id: '#CMP887', name: 'Biological Computing', dateTime: '02-07-2025 23:49' },
    { id: '#CMP888', name: 'Organic Computing', dateTime: '02-07-2025 23:50' },
    { id: '#CMP889', name: 'Hybrid Computing', dateTime: '02-07-2025 23:51' },
    { id: '#CMP890', name: 'Distributed Computing', dateTime: '02-07-2025 23:52' },
    { id: '#CMP891', name: 'Parallel Computing', dateTime: '02-07-2025 23:53' },
    { id: '#CMP892', name: 'Grid Computing', dateTime: '02-07-2025 23:54' },
    { id: '#CMP893', name: 'Cluster Computing', dateTime: '02-07-2025 23:55' },
    { id: '#CMP894', name: 'High Performance Computing', dateTime: '02-07-2025 23:56' },
    { id: '#CMP895', name: 'Supercomputing', dateTime: '02-07-2025 23:57' },
    { id: '#CMP896', name: 'Mainframe Computing', dateTime: '02-07-2025 23:58' },
    { id: '#CMP897', name: 'Embedded Computing', dateTime: '02-07-2025 23:59' },
    { id: '#CMP898', name: 'Mobile Computing', dateTime: '03-07-2025 00:00' },
    { id: '#CMP899', name: 'Ubiquitous Computing', dateTime: '03-07-2025 00:01' },
    { id: '#CMP900', name: 'Pervasive Computing', dateTime: '03-07-2025 00:02' },
  ];

  const totalPages = Math.ceil(industries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = industries.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    console.log('Edit industry:', id);
  };

  const handleView = (id: string) => {
    console.log('View industry:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete industry:', id);
  };

  const handleCreateIndustry = () => {
    console.log('Create new industry');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${i === currentPage
              ? 'bg-green-100 text-black'
              : 'text-[var(--text-secondary)] hover:text-black hover:bg-green-50'
            }
          `}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-[var(--text-secondary)]">
          Showing {startIndex + 1} to {Math.min(endIndex, industries.length)} of {industries.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-[var(--text-secondary)] hover:text-black hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {pages}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-[var(--text-secondary)] hover:text-black hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          {/* Table Header */}
          <div className="bg-[var(--accent)] px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Industry Master</h2>
            <button
              onClick={handleCreateIndustry}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Industry</span>
            </button>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Industry ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Industry Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {currentData.map((item) => (
                  <tr 
                    key={item.id + item.name}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {item.dateTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="Edit Industry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleView(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="View Industry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="Delete Industry"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Industry Master</h2>
            <button
              onClick={handleCreateIndustry}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
        
        {currentData.map((item) => (
          <div 
            key={item.id + item.name}
            className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                  title="Edit Industry"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleView(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                  title="View Industry"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                  title="Delete Industry"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Industry Name:</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
                <span className="text-sm text-[var(--text-secondary)]">{item.dateTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default IndustryMaster;
