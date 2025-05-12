import React, { useState } from 'react';
import { InspectionUnit } from '../../types';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface UnitInspectionProps {
  units: InspectionUnit[];
  updateStatus: (unitIndex: number, checkpointIndex: number, status: 'Good' | 'Bad' | 'Better') => void;
  updateComment: (unitIndex: number, checkpointIndex: number, comment: string) => void;
}

const UnitInspection: React.FC<UnitInspectionProps> = ({ units, updateStatus, updateComment }) => {
  const [expandedUnit, setExpandedUnit] = useState<number | null>(0);
  const [commentOpen, setCommentOpen] = useState<{unitIndex: number, checkpointIndex: number} | null>(null);

  const toggleUnit = (index: number) => {
    setExpandedUnit(expandedUnit === index ? null : index);
  };

  const toggleComment = (unitIndex: number, checkpointIndex: number) => {
    const key = { unitIndex, checkpointIndex };
    setCommentOpen(
      commentOpen?.unitIndex === unitIndex && commentOpen?.checkpointIndex === checkpointIndex
        ? null
        : key
    );
  };

  const handleStatusChange = (unitIndex: number, checkpointIndex: number, status: 'Good' | 'Bad' | 'Better') => {
    updateStatus(unitIndex, checkpointIndex, status);
  };

  const handleCommentChange = (unitIndex: number, checkpointIndex: number, comment: string) => {
    updateComment(unitIndex, checkpointIndex, comment);
  };

  return (
    <div className="space-y-6">
      <div className="px-4 py-5 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Machine Inspection</h3>
        <p className="text-sm text-blue-600 mb-4">
          Rate each checkpoint as Good, Bad, or Better. Add comments for any issues or special observations.
        </p>
      </div>

      {units.map((unit, unitIndex) => (
        <div key={unitIndex} className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className={`flex justify-between items-center p-4 cursor-pointer ${
              expandedUnit === unitIndex ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'
            }`}
            onClick={() => toggleUnit(unitIndex)}
          >
            <h3 className="text-base font-medium text-gray-900">{unit.name}</h3>
            <div className="flex items-center">
              {unit.unitScore > 0 && (
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                    unit.unitScore >= 70 
                      ? 'bg-green-100 text-green-800' 
                      : unit.unitScore >= 50 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {unit.unitScore}%
                </span>
              )}
              {expandedUnit === unitIndex ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          
          {expandedUnit === unitIndex && (
            <div className="p-4 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Checkpoint
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unit.checkpoints.map((checkpoint, checkpointIndex) => (
                    <React.Fragment key={checkpoint.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{checkpoint.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(unitIndex, checkpointIndex, 'Good')}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                checkpoint.status === 'Good'
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Good
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(unitIndex, checkpointIndex, 'Bad')}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                checkpoint.status === 'Bad'
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Bad
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(unitIndex, checkpointIndex, 'Better')}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                checkpoint.status === 'Better'
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Better
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => toggleComment(unitIndex, checkpointIndex)}
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              checkpoint.comments
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1" />
                            {checkpoint.comments ? 'Edit Comment' : 'Add Comment'}
                          </button>
                        </td>
                      </tr>
                      {commentOpen?.unitIndex === unitIndex && commentOpen?.checkpointIndex === checkpointIndex && (
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-6 py-4">
                            <div className="space-y-2">
                              <label htmlFor={`comment-${unitIndex}-${checkpointIndex}`} className="block text-xs font-medium text-gray-700">
                                Comment for {checkpoint.name}
                              </label>
                              <textarea
                                id={`comment-${unitIndex}-${checkpointIndex}`}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                placeholder="Add detailed observations or issues..."
                                value={checkpoint.comments || ''}
                                onChange={(e) => handleCommentChange(unitIndex, checkpointIndex, e.target.value)}
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => toggleComment(unitIndex, checkpointIndex)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Save Comment
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UnitInspection;