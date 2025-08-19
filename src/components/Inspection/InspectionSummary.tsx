import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from '../../context/FormContext';

interface InspectionReport {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  location?: string;
  date?: string;
  machine: {
    id: number;
    name: string;
    serialNumber: string;
    manufacturer: string;
    year: number;
    totalImpressions: string;
    group: string;
    seller: {
      companyName: string;
      address: string;
    };
    buyer: {
      companyName: string;
      address: string;
    };
  };
  generalInfo: {
    inspectionPlace: string;
    inspectionDate: string;
    inspectorName: string;
    inspectorRole: string;
    answers: Record<number, string>;
    controlStation: {
      stationName: string;
      modelType: string;
      checks: Array<{
        thingToCheck: string;
        condition: string;
        remarks: string;
      }>;
    };
    colorMeasurement: {
      deviceName: string;
      version: string;
      deviceCondition: string;
      deviceComments: string;
      calibrationStatus: string;
      calibrationComments: string;
    };
  };
  units: Array<{
    id: number;
    name: string;
    subUnits: Array<{
      id: number;
      name: string;
      checkpoints: Array<{
        id: number;
        name: string;
        condition: string;
        remarks: string;
      }>;
    }>;
    unitScore: number;
  }>;
  overallRating: 'Excellent' | 'Good' | 'Average' | 'Not Good';
  overallScore: number;
}

const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const inspectorId = userData.id || 0;
  const inspectorName = userData.name || 'Unknown Inspector';
  const inspectorRole = userData.roles || 'Unknown';

interface InspectionSummaryProps {
  report?: InspectionReport;
  questions?: {
    id: number;
    question: string;
  }[];
  controlStations?: Array<{
    id: number;
    name: string;
    thingToChecks: Array<{
      id: number;
      things_to_check: string;
    }>;
  }>;
}
const InspectionSummary: React.FC<InspectionSummaryProps> = ({ report, questions = [],controlStations = []  }) => {
  const { formState } = useForm();
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});
  
  const safeReport = {
    ...report,
    customerInfo: formState.customerInfo,
    machine: {
      id: formState.machineId || 0,
      name: formState.machineName || 'Unknown Machine',
      serialNumber: formState.machineDetails?.serial_number || 'N/A',
      manufacturer: formState.machineDetails?.manufacturer || 'N/A',
      year: formState.machineDetails?.year || 0,
      totalImpressions: formState.machineDetails?.total_impressions || '0',
      group: formState.machineDetails?.group?.name || 'N/A',
      seller: {
        companyName: formState.machineDetails?.seller?.company_name || 'N/A',
        address: formState.machineDetails?.seller?.address || 'N/A',
      },
      buyer: {
        companyName: formState.machineDetails?.buyer?.company_name || 'N/A',
        address: formState.machineDetails?.buyer?.address || 'N/A',
      },
    },
    generalInfo: formState.generalInfo,
    units: formState.units
  };

  const calculateStats = () => {
    let good = 0, bad = 0, better = 0, total = 0;
    
    safeReport.units.forEach((unit: any) => {
      unit.subUnits?.forEach((subUnit: any) => {
        subUnit.checkpoints?.forEach((checkpoint: any) => {
          total++;
          if (checkpoint.condition === 'Good') good++;
          else if (checkpoint.condition === 'Bad') bad++;
          else if (checkpoint.condition === 'Better') better++;
        });
      });
    });
    
    return { good, bad, better, total };
  };

  const stats = calculateStats();

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Not Good': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="col-span-2 font-medium">{safeReport.customerInfo.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspection Report</h1>
            <p className="text-sm text-gray-600 mt-1">
              Final review of the inspection details
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Overall Rating</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(safeReport?.overallRating ?? '')}`}>
              {safeReport.overallRating ?? '80'} ({safeReport?.overallScore}%)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Machine Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Machine Specification</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Name:</span>
                <span className="col-span-2 font-medium">{safeReport.machine?.name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Serial Number:</span>
                <span className="col-span-2 font-medium">{safeReport.machine.serialNumber}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Manufacturer:</span>
                <span className="col-span-2 font-medium">{safeReport.machine.manufacturer}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Year:</span>
                <span className="col-span-2 font-medium">{safeReport.machine.year}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Impressions:</span>
                <span className="col-span-2 font-medium">{safeReport.machine.totalImpressions}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Group:</span>
                <span className="col-span-2 font-medium">{safeReport.machine.group}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ownership Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Seller Information</h4>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-gray-500">Company:</span> {safeReport.machine.seller.companyName}</p>
                  <p className="text-sm"><span className="text-gray-500">Address:</span> {safeReport.machine.seller.address}</p>
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Buyer Information</h4>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-gray-500">Company:</span> {safeReport.machine.buyer.companyName}</p>
                  <p className="text-sm"><span className="text-gray-500">Address:</span> {safeReport.machine.buyer.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inspection Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Place:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.inspectionPlace}, {}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.inspectionDate}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Inspector:</span>
                <span className="col-span-2 font-medium">{inspectorName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Role:</span>
                <span className="col-span-2 font-medium">{inspectorRole}</span>
              </div>
            </div>
            {Object.keys(safeReport.generalInfo.answers).length > 0 && (
              <>
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">General Questions</h3>
                <div className="space-y-3">
  {Object.entries(safeReport.generalInfo.answers).map(([questionId, answer]) => {
    // Find the question text from your questions data
    let questionText = `Question ${questionId}`;
    if (questions && questions.length > 0) {
      const found = questions.find(q => q.id === parseInt(questionId, 10));
      if (found) questionText = found.question;
    }
    return (
      <div key={questionId} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <span className="text-sm text-gray-500">{questionText}</span>
        <span className="md:col-span-2 font-medium">{answer || 'Not answered'}</span>
      </div>
    );
  })}
</div>
              </>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Control Station</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Station:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.controlStation?.stationId}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Model Type:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.controlStation?.modelType}</span>
              </div>
              {safeReport.generalInfo.controlStation?.checks && 
 Object.entries(safeReport.generalInfo.controlStation.checks).length > 0 && (
  <>
    <h4 className="text-md font-medium text-gray-800 mt-4 mb-2">Checks</h4>
    <div className="space-y-3">
      {safeReport.generalInfo.controlStation?.checks && 
  Object.entries(safeReport.generalInfo.controlStation.checks).length > 0 && (
    <>
      <h4 className="text-md font-medium text-gray-800 mt-4 mb-2">Checks</h4>
      <div className="space-y-3">
        {Object.entries(safeReport.generalInfo.controlStation.checks).map(([checkId, check]) => {
          // If you don't have access to controlStations, just display the check ID
          const checkText = check.thingToCheck || `${checkId}`;
          
          return (
            <div key={checkId} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <span className="text-sm text-gray-500">{checkText}</span>
              <span className="text-sm font-medium">
                <span className="text-gray-500">Condition: </span>
                {check.condition || 'Not specified'}
              </span>
              <span className="text-sm font-medium">
                <span className="text-gray-500">Remarks: </span>
                {check.remarks || 'None'}
              </span>
            </div>
          );
        })}
      </div>
    </>
)}
    </div>
  </>
)}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Color Measurement</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Device:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.colorMeasurement?.deviceId}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Version:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.colorMeasurement?.version}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Condition:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.colorMeasurement?.deviceCondition}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Comments:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.colorMeasurement?.deviceComments || 'None'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Calibration:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.colorMeasurement?.calibrationStatus}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-sm text-gray-500">Calibration Comments:</span>
                <span className="col-span-2 font-medium">{safeReport.generalInfo.colorMeasurement?.calibrationComments || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">Unit Inspection Results</h2> */}
        
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"> */}
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Checkpoints</div>
            <div className="text-xl font-semibold">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Good</div>
            <div className="text-xl font-semibold text-green-700">{stats.good}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600">Better</div>
            <div className="text-xl font-semibold text-yellow-700">{stats.better}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600">Bad</div>
            <div className="text-xl font-semibold text-red-700">{stats.bad}</div>
          </div> */}
        {/* </div> */}

        {safeReport.units.length > 0 ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Unit Performance</h3>
            <div className="space-y-4">
              {safeReport.units.map((unit) => (
                <div key={unit.id} className="border rounded-lg p-4">
                  <div 
                    className="flex justify-between items-center mb-3 cursor-pointer"
                    onClick={() => toggleUnit(unit.id)}
                  >
                    <h4 className="font-medium text-gray-900">{unit.name}</h4>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                        unit.unitScore >= 70 ? 'bg-green-100 text-green-800' :
                        unit.unitScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Score: {unit.unitScore ?? '80'}%
                      </span>
                      {expandedUnits[unit.id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {expandedUnits[unit.id] && unit.subUnits?.length > 0 && (
                    <div className="space-y-4">
                      {unit.subUnits.map((subUnit) => (
                        <div key={subUnit.id} className="ml-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">{subUnit.name}</h5>
                          {subUnit.checkpoints?.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkpoint</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {subUnit.checkpoints.map((checkpoint) => (
                                    <tr key={checkpoint.id}>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {checkpoint.name}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                          checkpoint.condition === 'Good' ? 'bg-green-100 text-green-800' :
                                          checkpoint.condition === 'Better' ? 'bg-blue-100 text-blue-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>  
                                          {checkpoint.condition}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {checkpoint.remarks || 'None'}
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
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">No unit inspection data available</p>
        )}
      </div>
    </div>
  );
};

export default InspectionSummary;