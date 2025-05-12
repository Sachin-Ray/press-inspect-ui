import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, FileText, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReport } from '../../context/ReportContext';

const UserDashboard: React.FC = () => {
  const { state } = useAuth();
  const { reports } = useReport();
  
  // Filter reports based on user role and ID
  const userReports = reports.filter(report => report.userId === state.user?.id);
  
  // Get recent reports
  const recentReports = [...userReports].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  // Get role-specific title
  const getRoleTitle = () => {
    switch(state.user?.roles) {
      case 'PrePressInspector':
        return 'Pre Press Inspector';
      case 'PressInspector':
        return 'Press Inspector';
      case 'PostPressInspector':
        return 'Post Press Inspector';
      case 'PackagingInspector':
        return 'Packaging Inspector';
      default:
        return 'Inspector';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{getRoleTitle()} Dashboard</h1>
        <div className="flex space-x-2">
          <Link
            to="/inspection/new"
            className="inline-flex items-center px-4 py-2 bg-[#0F52BA] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            New Inspection
          </Link>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">My Reports</p>
              <p className="text-2xl font-bold text-gray-900">{userReports.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-[#0F52BA]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Registration ID</p>
              <p className="text-xl font-bold text-gray-900">{state.user?.registrationId || 'N/A'}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-xl font-bold text-gray-900">{state.user?.country || 'Global'}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <HelpCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 py-4 px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">My Recent Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <div key={report.id} className="py-4 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {report.group} - {report.model} {report.item}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Customer: {report.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.overallRating === 'Good'
                          ? 'bg-green-100 text-green-800'
                          : report.overallRating === 'Average'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {report.overallRating}
                    </span>
                    <Link
                      to={`/reports/${report.id}`}
                      className="text-[#0F52BA] hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 px-6 text-center text-gray-500">
              You haven't created any reports yet.
            </div>
          )}
        </div>
        <div className="py-3 px-6 bg-gray-50 border-t border-gray-200">
          <Link
            to="/reports"
            className="text-sm font-medium text-[#0F52BA] hover:text-blue-700"
          >
            View all my reports →
          </Link>
        </div>
      </div>

      {/* Quick guide */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 py-4 px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Guide</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-[#0F52BA]">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Create a New Inspection</h3>
                <p className="text-sm text-gray-500">
                  Click on "New Inspection" to start a new machine inspection report.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-[#0F52BA]">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Select Machine Type</h3>
                <p className="text-sm text-gray-500">
                  Choose the appropriate group, model, and machine item from the dropdown.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-[#0F52BA]">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Fill in Checkpoints</h3>
                <p className="text-sm text-gray-500">
                  Rate each checkpoint as Good, Bad, or Better and add comments if needed.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-[#0F52BA]">
                4
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Submit Report</h3>
                <p className="text-sm text-gray-500">
                  The system will calculate scores and provide an overall rating for the machine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;