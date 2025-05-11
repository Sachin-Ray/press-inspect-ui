import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { useReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReportById } = useReport();
  const { state } = useAuth();
  const [expandedUnits, setExpandedUnits] = React.useState<number[]>([]);
  
  const report = id ? getReportById(id) : null;
  
  // Check if user has access to this report
  const hasAccess = 
    state.user?.roles === 'Admin' || state.user?.roles === 'SuperAdmin' ||
    (report && report.userId === state.user?.id);
  
  if (!report) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
        <p className="text-gray-600 mb-6">The report you're looking for doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0F52BA] hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this report.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0F52BA] hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  // Toggle unit expansion
  const toggleUnit = (index: number) => {
    setExpandedUnits(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  
  // Expand all units
  const expandAll = () => {
    setExpandedUnits(report.units.map((_, index) => index));
  };
  
  // Collapse all units
  const collapseAll = () => {
    setExpandedUnits([]);
  };
  
  // Get rating color class
  const getRatingColorClass = (rating: string) => {
    switch (rating) {
      case 'Good':
        return 'bg-green-100 text-green-800';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Good':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status color class
  const getStatusColorClass = (status: string | null) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-800';
      case 'Bad':
        return 'bg-red-100 text-red-800';
      case 'Better':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-1 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Inspection Report
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/reports/${report.id}/download`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Link>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </button>
        </div>
      </div>
      
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                {report.group} - {report.model} {report.item}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Year Range: {report.year}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingColorClass(report.overallRating)}`}>
                {report.overallRating} ({report.overallScore}%)
              </span>
              <span className="ml-4 text-sm text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
              <p className="text-sm font-medium text-gray-900">{report.customerName}</p>
              <p className="text-sm text-gray-600">{report.customerEmail}</p>
              <p className="text-sm text-gray-600">{report.customerPhone}</p>
              <p className="text-sm text-gray-600">{report.location}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Inspection Details</h3>
              <p className="text-sm text-gray-600">Inspector: <span className="font-medium text-gray-900">{report.inspectorName}</span></p>
              <p className="text-sm text-gray-600">Registration ID: <span className="font-medium text-gray-900">{report.registrationId}</span></p>
              <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-900">{report.date}</span></p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Report Summary</h3>
              <p className="text-sm text-gray-600">
                Units Inspected: <span className="font-medium text-gray-900">{report.units.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Checkpoints: <span className="font-medium text-gray-900">
                  {report.units.reduce((sum, unit) => sum + unit.checkpoints.length, 0)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Created: <span className="font-medium text-gray-900">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Units Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Inspection Details</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={expandAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Collapse All
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {report.units.map((unit, unitIndex) => (
            <div key={unitIndex}>
              <div 
                className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleUnit(unitIndex)}
              >
                <div className="flex items-center">
                  <h3 className="text-base font-medium text-gray-900">{unit.name}</h3>
                  <span 
                    className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      unit.unitScore >= 70 
                        ? 'bg-green-100 text-green-800' 
                        : unit.unitScore >= 50 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {unit.unitScore}%
                  </span>
                </div>
                {expandedUnits.includes(unitIndex) 
                  ? <ChevronUp className="h-5 w-5 text-gray-400" />
                  : <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </div>
              
              {expandedUnits.includes(unitIndex) && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Checkpoint
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unit.checkpoints.map((checkpoint, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {checkpoint.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {checkpoint.status && (
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(checkpoint.status)}`}>
                                {checkpoint.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {checkpoint.comments || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Comments Section */}
      {report.comments && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Additional Comments</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600">{report.comments}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;