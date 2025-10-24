import React, { useState } from 'react';
import { Edit, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Designation {
  id: string;
  name: string;
  dateTime: string;
}

const DesignationMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data as requested
  const designations: Designation[] = [
    { id: '#CMP801', name: 'Designation 1', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Designation 2', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Designation 3', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Designation 4', dateTime: '02-07-2025 22:23' },
    { id: '#CMP801', name: 'Designation 5', dateTime: '02-07-2025 22:23' },
    // Adding more sample data for pagination demonstration
    { id: '#CMP802', name: 'Software Engineer', dateTime: '02-07-2025 22:24' },
    { id: '#CMP803', name: 'Senior Developer', dateTime: '02-07-2025 22:25' },
    { id: '#CMP804', name: 'Team Lead', dateTime: '02-07-2025 22:26' },
    { id: '#CMP805', name: 'Project Manager', dateTime: '02-07-2025 22:27' },
    { id: '#CMP806', name: 'Product Manager', dateTime: '02-07-2025 22:28' },
    { id: '#CMP807', name: 'UX Designer', dateTime: '02-07-2025 22:29' },
    { id: '#CMP808', name: 'UI Designer', dateTime: '02-07-2025 22:30' },
    { id: '#CMP809', name: 'DevOps Engineer', dateTime: '02-07-2025 22:31' },
    { id: '#CMP810', name: 'Data Scientist', dateTime: '02-07-2025 22:32' },
    { id: '#CMP811', name: 'Business Analyst', dateTime: '02-07-2025 22:33' },
    { id: '#CMP812', name: 'Quality Assurance', dateTime: '02-07-2025 22:34' },
    { id: '#CMP813', name: 'Technical Writer', dateTime: '02-07-2025 22:35' },
    { id: '#CMP814', name: 'System Administrator', dateTime: '02-07-2025 22:36' },
    { id: '#CMP815', name: 'Database Administrator', dateTime: '02-07-2025 22:37' },
    { id: '#CMP816', name: 'Network Engineer', dateTime: '02-07-2025 22:38' },
    { id: '#CMP817', name: 'Security Analyst', dateTime: '02-07-2025 22:39' },
    { id: '#CMP818', name: 'Cloud Architect', dateTime: '02-07-2025 22:40' },
    { id: '#CMP819', name: 'Solution Architect', dateTime: '02-07-2025 22:41' },
    { id: '#CMP820', name: 'Technical Lead', dateTime: '02-07-2025 22:42' },
    { id: '#CMP821', name: 'Frontend Developer', dateTime: '02-07-2025 22:43' },
    { id: '#CMP822', name: 'Backend Developer', dateTime: '02-07-2025 22:44' },
    { id: '#CMP823', name: 'Full Stack Developer', dateTime: '02-07-2025 22:45' },
    { id: '#CMP824', name: 'Mobile Developer', dateTime: '02-07-2025 22:46' },
    { id: '#CMP825', name: 'Machine Learning Engineer', dateTime: '02-07-2025 22:47' },
    { id: '#CMP826', name: 'AI Engineer', dateTime: '02-07-2025 22:48' },
    { id: '#CMP827', name: 'Blockchain Developer', dateTime: '02-07-2025 22:49' },
    { id: '#CMP828', name: 'Game Developer', dateTime: '02-07-2025 22:50' },
    { id: '#CMP829', name: 'Web Developer', dateTime: '02-07-2025 22:51' },
    { id: '#CMP830', name: 'Software Architect', dateTime: '02-07-2025 22:52' },
    { id: '#CMP831', name: 'Scrum Master', dateTime: '02-07-2025 22:53' },
    { id: '#CMP832', name: 'Agile Coach', dateTime: '02-07-2025 22:54' },
    { id: '#CMP833', name: 'Release Manager', dateTime: '02-07-2025 22:55' },
    { id: '#CMP834', name: 'Configuration Manager', dateTime: '02-07-2025 22:56' },
    { id: '#CMP835', name: 'Test Manager', dateTime: '02-07-2025 22:57' },
    { id: '#CMP836', name: 'Performance Engineer', dateTime: '02-07-2025 22:58' },
    { id: '#CMP837', name: 'Automation Engineer', dateTime: '02-07-2025 22:59' },
    { id: '#CMP838', name: 'Site Reliability Engineer', dateTime: '02-07-2025 23:00' },
    { id: '#CMP839', name: 'Platform Engineer', dateTime: '02-07-2025 23:01' },
    { id: '#CMP840', name: 'Infrastructure Engineer', dateTime: '02-07-2025 23:02' },
    { id: '#CMP841', name: 'Cybersecurity Engineer', dateTime: '02-07-2025 23:03' },
    { id: '#CMP842', name: 'Penetration Tester', dateTime: '02-07-2025 23:04' },
    { id: '#CMP843', name: 'Security Architect', dateTime: '02-07-2025 23:05' },
    { id: '#CMP844', name: 'Compliance Officer', dateTime: '02-07-2025 23:06' },
    { id: '#CMP845', name: 'Risk Manager', dateTime: '02-07-2025 23:07' },
    { id: '#CMP846', name: 'IT Director', dateTime: '02-07-2025 23:08' },
    { id: '#CMP847', name: 'CTO', dateTime: '02-07-2025 23:09' },
    { id: '#CMP848', name: 'VP of Engineering', dateTime: '02-07-2025 23:10' },
    { id: '#CMP849', name: 'Engineering Manager', dateTime: '02-07-2025 23:11' },
    { id: '#CMP850', name: 'Development Manager', dateTime: '02-07-2025 23:12' },
    { id: '#CMP851', name: 'Operations Manager', dateTime: '02-07-2025 23:13' },
    { id: '#CMP852', name: 'Support Manager', dateTime: '02-07-2025 23:14' },
    { id: '#CMP853', name: 'Customer Success Manager', dateTime: '02-07-2025 23:15' },
    { id: '#CMP854', name: 'Account Manager', dateTime: '02-07-2025 23:16' },
    { id: '#CMP855', name: 'Sales Manager', dateTime: '02-07-2025 23:17' },
    { id: '#CMP856', name: 'Marketing Manager', dateTime: '02-07-2025 23:18' },
    { id: '#CMP857', name: 'Content Manager', dateTime: '02-07-2025 23:19' },
    { id: '#CMP858', name: 'Social Media Manager', dateTime: '02-07-2025 23:20' },
    { id: '#CMP859', name: 'Digital Marketing Manager', dateTime: '02-07-2025 23:21' },
    { id: '#CMP860', name: 'SEO Specialist', dateTime: '02-07-2025 23:22' },
    { id: '#CMP861', name: 'PPC Specialist', dateTime: '02-07-2025 23:23' },
    { id: '#CMP862', name: 'Email Marketing Specialist', dateTime: '02-07-2025 23:24' },
    { id: '#CMP863', name: 'Content Writer', dateTime: '02-07-2025 23:25' },
    { id: '#CMP864', name: 'Copywriter', dateTime: '02-07-2025 23:26' },
    { id: '#CMP865', name: 'Technical Writer', dateTime: '02-07-2025 23:27' },
    { id: '#CMP866', name: 'Documentation Specialist', dateTime: '02-07-2025 23:28' },
    { id: '#CMP867', name: 'Training Specialist', dateTime: '02-07-2025 23:29' },
    { id: '#CMP868', name: 'Learning & Development Manager', dateTime: '02-07-2025 23:30' },
    { id: '#CMP869', name: 'HR Manager', dateTime: '02-07-2025 23:31' },
    { id: '#CMP870', name: 'Recruiter', dateTime: '02-07-2025 23:32' },
    { id: '#CMP871', name: 'Talent Acquisition Specialist', dateTime: '02-07-2025 23:33' },
    { id: '#CMP872', name: 'Compensation Analyst', dateTime: '02-07-2025 23:34' },
    { id: '#CMP873', name: 'Benefits Administrator', dateTime: '02-07-2025 23:35' },
    { id: '#CMP874', name: 'Payroll Specialist', dateTime: '02-07-2025 23:36' },
    { id: '#CMP875', name: 'Employee Relations Specialist', dateTime: '02-07-2025 23:37' },
    { id: '#CMP876', name: 'Organizational Development Specialist', dateTime: '02-07-2025 23:38' },
    { id: '#CMP877', name: 'Change Management Specialist', dateTime: '02-07-2025 23:39' },
    { id: '#CMP878', name: 'Culture Manager', dateTime: '02-07-2025 23:40' },
    { id: '#CMP879', name: 'Diversity & Inclusion Manager', dateTime: '02-07-2025 23:41' },
    { id: '#CMP880', name: 'Workplace Experience Manager', dateTime: '02-07-2025 23:42' },
    { id: '#CMP881', name: 'Facilities Manager', dateTime: '02-07-2025 23:43' },
    { id: '#CMP882', name: 'Office Manager', dateTime: '02-07-2025 23:44' },
    { id: '#CMP883', name: 'Executive Assistant', dateTime: '02-07-2025 23:45' },
    { id: '#CMP884', name: 'Administrative Assistant', dateTime: '02-07-2025 23:46' },
    { id: '#CMP885', name: 'Receptionist', dateTime: '02-07-2025 23:47' },
    { id: '#CMP886', name: 'Office Coordinator', dateTime: '02-07-2025 23:48' },
    { id: '#CMP887', name: 'Event Coordinator', dateTime: '02-07-2025 23:49' },
    { id: '#CMP888', name: 'Community Manager', dateTime: '02-07-2025 23:50' },
    { id: '#CMP889', name: 'Partnership Manager', dateTime: '02-07-2025 23:51' },
    { id: '#CMP890', name: 'Business Development Manager', dateTime: '02-07-2025 23:52' },
    { id: '#CMP891', name: 'Strategic Partnerships Manager', dateTime: '02-07-2025 23:53' },
    { id: '#CMP892', name: 'Alliance Manager', dateTime: '02-07-2025 23:54' },
    { id: '#CMP893', name: 'Channel Manager', dateTime: '02-07-2025 23:55' },
    { id: '#CMP894', name: 'Distribution Manager', dateTime: '02-07-2025 23:56' },
    { id: '#CMP895', name: 'Supply Chain Manager', dateTime: '02-07-2025 23:57' },
    { id: '#CMP896', name: 'Procurement Manager', dateTime: '02-07-2025 23:58' },
    { id: '#CMP897', name: 'Vendor Manager', dateTime: '02-07-2025 23:59' },
    { id: '#CMP898', name: 'Contract Manager', dateTime: '03-07-2025 00:00' },
    { id: '#CMP899', name: 'Legal Counsel', dateTime: '03-07-2025 00:01' },
    { id: '#CMP900', name: 'Compliance Manager', dateTime: '03-07-2025 00:02' },
  ];

  const totalPages = Math.ceil(designations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = designations.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    console.log('Edit designation:', id);
  };

  const handleCreateDesignation = () => {
    console.log('Create new designation');
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
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
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
          Showing {startIndex + 1} to {Math.min(endIndex, designations.length)} of {designations.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {pages}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] overflow-hidden">
          {/* Table Header */}
          <div className="bg-[var(--accent)] px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Designation Master</h2>
            <button
              onClick={handleCreateDesignation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Designation</span>
            </button>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Designation ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Designation Name
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
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--accent)] rounded-lg transition-all duration-200"
                        title="Edit Designation"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
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
        <div className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Designation Master</h2>
            <button
              onClick={handleCreateDesignation}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
        
        {currentData.map((item) => (
          <div 
            key={item.id + item.name}
            className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] p-4 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
              <button
                onClick={() => handleEdit(item.id)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--accent)] rounded-lg transition-all duration-200"
                title="Edit Designation"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Designation Name:</span>
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

export default DesignationMaster;
