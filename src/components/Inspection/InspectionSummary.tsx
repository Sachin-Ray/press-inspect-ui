import React from 'react';
import { InspectionReport } from '../../types';

interface InspectionSummaryProps {
  report: InspectionReport;
}

const InspectionSummary: React.FC<InspectionSummaryProps> = ({ report }) => {
  // Get the rating color
  const getRatingColor = (rating: 'Excellent' | 'Good' | 'Average' | 'Not Good') => {
    switch (rating) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-green-80 text-green-400';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Good':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Count checkpoints by status
  const countStatuses = () => {
    let good = 0, bad = 0, better = 0, total = 0;
    
    report.units.forEach(unit => {
      unit.checkpoints.forEach(checkpoint => {
        if (checkpoint.status) {
          total++;
          if (checkpoint.status === 'Good') good++;
          else if (checkpoint.status === 'Bad') bad++;
          else if (checkpoint.status === 'Better') better++;
        }
      });
    });
    
    return { good, bad, better, total };
  };

  const statusCounts = countStatuses();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Inspection Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review the inspection details before submitting
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-sm text-gray-500 mb-1">Overall Rating</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(report.overallRating)}`}>
              {report.overallRating} ({report.overallScore}%)
            </div>
          </div>
        </div>
      </div>

      {/* Machine and Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Machine Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Group</div>
              <div className="font-medium">{report.group}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Model</div>
              <div className="font-medium">{report.model}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Item</div>
              <div className="font-medium">{report.item}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Year Range</div>
              <div className="font-medium">{report.year}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Customer Name</div>
              <div className="font-medium">{report.customerName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium">{report.location}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{report.customerEmail || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium">{report.customerPhone || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Inspection Statistics</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Checkpoints</div>
            <div className="text-xl font-semibold">{statusCounts.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Good</div>
            <div className="text-xl font-semibold text-green-700">{statusCounts.good}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600">Bad</div>
            <div className="text-xl font-semibold text-red-700">{statusCounts.bad}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Better</div>
            <div className="text-xl font-semibold text-blue-700">{statusCounts.better}</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Unit Scores</h5>
          <div className="space-y-2">
            {report.units.map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="w-1/3 text-sm">{unit.name}</div>
                <div className="w-2/3">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        {unit.unitScore}%
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${unit.unitScore}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          unit.unitScore >= 70 
                            ? 'bg-green-500' 
                            : unit.unitScore >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspector Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Inspector Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Inspector Name</div>
            <div className="font-medium">{report.inspectorName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Registration ID</div>
            <div className="font-medium">{report.registrationId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Inspection Date</div>
            <div className="font-medium">{report.date}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionSummary;