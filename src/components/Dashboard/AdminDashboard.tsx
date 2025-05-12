import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Users, FileText, Settings, HelpCircle, Download } from 'lucide-react';
import { useReport } from '../../context/ReportContext';

const AdminDashboard: React.FC = () => {
  const { reports } = useReport();

  // Calculate statistics
  const totalReports = reports.length;
  const reportsByGroup = reports.reduce((acc, report) => {
    const group = report.group;
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get recent reports
  const recentReports = [...reports].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        {/* <div className="flex space-x-2">
          <Link
            to="/inspection/new"
            className="inline-flex items-center px-4 py-2 bg-[#0F52BA] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            New Inspection
          </Link>
        </div> */}
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-[#0F52BA]" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Press Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reportsByGroup['Press'] || 0}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pre Press Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reportsByGroup['Pre Press'] || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 py-4 px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
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
                          {new Date(report.createdAt).toLocaleDateString()} by {report.inspectorName}
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
                  No reports available yet.
                </div>
              )}
            </div>
            <div className="py-3 px-6 bg-gray-50 border-t border-gray-200">
              <Link
                to="/reports/all"
                className="text-sm font-medium text-[#0F52BA] hover:text-blue-700"
              >
                View all reports →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 py-4 px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/reports/all"
                className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group"
              >
                <FileText className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                <span className="flex-1">View All Reports</span>
              </Link>
              <Link
                to="/reports/download"
                className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group"
              >
                <Download className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                <span className="flex-1">Download Reports</span>
              </Link>
              <Link
                to="/users"
                className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group"
              >
                <Users className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                <span className="flex-1">Manage Users</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group"
              >
                <Settings className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                <span className="flex-1">System Settings</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group"
              >
                <HelpCircle className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                <span className="flex-1">Help & Documentation</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;