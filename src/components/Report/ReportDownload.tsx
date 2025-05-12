import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';

const ReportDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReportById } = useReport();
  const { state } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  
  const report = id ? getReportById(id) : null;
  
  // Check if user has access to this report
  const hasAccess = 
    state.user?.roles === 'Admin' || state.user?.roles === 'SuperAdmin' ||
    (report && report.userId === state.user?.id);
  
  useEffect(() => {
    if (report && hasAccess) {
      // Simulate PDF generation
      setIsGenerating(true);
      const timer = setTimeout(() => {
        setIsGenerating(false);
        setDownloadReady(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [report, hasAccess]);
  
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
        <p className="text-gray-600 mb-6">You don't have permission to download this report.</p>
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
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/reports/${id}`)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Report
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-900">
            Download Report
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {report.group} - {report.model} {report.item} | {report.customerName}
          </p>
        </div>
        
        <div className="p-6">
          <div className="text-center py-6">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F52BA]"></div>
                </div>
                <p className="text-gray-600">Generating PDF report...</p>
              </div>
            ) : downloadReady ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 rounded-full p-3">
                    <FileText className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Report Ready</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your inspection report has been successfully generated and is ready for download.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // In a real app, this would download the actual PDF
                      alert('In a production environment, this would download the actual PDF file.');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0F52BA] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Something went wrong. Please try again.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Report Format Options</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  alert('In a production environment, this would download the report as a PDF.');
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download as PDF
              </button>
              <button
                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  alert('In a production environment, this would download the report as CSV data.');
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDownload;