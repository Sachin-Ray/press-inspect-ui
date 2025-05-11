import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Download, Filter } from 'lucide-react';
import { useReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';

interface ReportListProps {
  showAll?: boolean;
}

const ReportList: React.FC<ReportListProps> = ({ showAll = false }) => {
  const { reports } = useReport();
  const { state } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  // Filter reports based on user role and showAll prop
  const filteredReports = showAll || state.user?.roles === 'Admin' || state.user?.roles === 'SuperAdmin'
    ? reports 
    : reports.filter(report => report.userId === state.user?.id);

  // Apply search and filter
  const displayedReports = filteredReports
    .filter(report => {
      const matchesSearch = 
        report.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = !filter || report.group === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get unique groups for filter
  const groups = Array.from(new Set(reports.map(report => report.group)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {showAll ? 'All Inspection Reports' : 'My Reports'}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search reports"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Groups</option>
              {groups.map((group, index) => (
                <option key={index} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {displayedReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{report.group}</div>
                          <div className="text-sm text-gray-500">{report.model} {report.item}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.customerName}</div>
                      <div className="text-sm text-gray-500">{report.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.inspectorName}</div>
                      <div className="text-sm text-gray-500">ID: {report.registrationId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.overallRating === 'Good'
                            ? 'bg-green-100 text-green-800'
                            : report.overallRating === 'Average'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.overallRating} ({report.overallScore}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/reports/${report.id}`}
                          className="text-[#0F52BA] hover:text-blue-700"
                        >
                          View
                        </Link>
                        <Link
                          to={`/reports/${report.id}/download`}
                          className="text-[#20B2AA] hover:text-teal-700"
                        >
                          <Download className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Get started by creating a new inspection report.'}
            </p>
            <div className="mt-6">
              <Link
                to="/inspection/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0F52BA] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                New Inspection
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;