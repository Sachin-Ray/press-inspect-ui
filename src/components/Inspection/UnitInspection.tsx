import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Plus, X } from 'lucide-react';
import { fetchAllConditionsName, fetchAllUnits, fetchSubUnitsForUnit, fetchThingsToCheckForSubUnit } from '../../services/api';

interface Unit {
  id: number;
  name: string;
}

interface SubUnit {
  id: number;
  sub_unit_name: string;
  unit_id: number;
}

interface ThingToCheck {
  id: number;
  things_to_check: string;
  sub_unit_id: number;
}

interface Condition {
  id: number;
  name: string;
}

interface InspectionCheckpoint {
  id: number;
  name: string;
  condition: string;
  remarks: string;
}

interface InspectionUnit {
  id: number;
  name: string;
  subUnits: {
    id: number;
    name: string;
    checkpoints: InspectionCheckpoint[];
  }[];
}

interface UnitInspectionProps {
  onComplete: (units: InspectionUnit[]) => void;
  onBack: () => void;
  initialUnits?: InspectionUnit[];
}

const UnitInspection: React.FC<UnitInspectionProps> = ({ 
  onComplete, 
  onBack,
  initialUnits = []
}) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<InspectionUnit[]>(initialUnits);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [remarkOpen, setRemarkOpen] = useState<{unitIndex: number, subUnitIndex: number, checkpointIndex: number} | null>(null);
  const [loading, setLoading] = useState({
    units: true,
    conditions: true,
    subUnits: false
  });
  const [error, setError] = useState<string | null>(null);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [selectedUnitToAdd, setSelectedUnitToAdd] = useState<Unit | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch units
        const unitsResponse = await fetchAllUnits();
        const unitsData = unitsResponse.data?.data || unitsResponse.data || [];
        setUnits(unitsData);

        // Fetch conditions
        const conditionsResponse = await fetchAllConditionsName();
        const conditionsData = conditionsResponse.data?.data || conditionsResponse.data || [];
        setConditions(conditionsData);

        setLoading({
          units: false,
          conditions: false,
          subUnits: false
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error connecting to server');
        setLoading({
          units: false,
          conditions: false,
          subUnits: false
        });
      }
    };

    fetchData();
  }, []);

  const toggleUnit = (index: number) => {
    setExpandedUnit(expandedUnit === index ? null : index);
  };

  const toggleRemark = (unitIndex: number, subUnitIndex: number, checkpointIndex: number) => {
    const key = { unitIndex, subUnitIndex, checkpointIndex };
    setRemarkOpen(
      remarkOpen?.unitIndex === unitIndex && 
      remarkOpen?.subUnitIndex === subUnitIndex && 
      remarkOpen?.checkpointIndex === checkpointIndex
        ? null
        : key
    );
  };

  const handleConditionChange = (unitIndex: number, subUnitIndex: number, checkpointIndex: number, condition: string) => {
    const updatedUnits = [...selectedUnits];
    updatedUnits[unitIndex].subUnits[subUnitIndex].checkpoints[checkpointIndex].condition = condition;
    setSelectedUnits(updatedUnits);
  };

  const handleRemarkChange = (unitIndex: number, subUnitIndex: number, checkpointIndex: number, remark: string) => {
    const updatedUnits = [...selectedUnits];
    updatedUnits[unitIndex].subUnits[subUnitIndex].checkpoints[checkpointIndex].remarks = remark;
    setSelectedUnits(updatedUnits);
  };

  const handleAddUnitClick = () => {
    setShowUnitSelector(true);
  };

  const handleUnitSelection = (unit: Unit) => {
    setSelectedUnitToAdd(unit);
    setShowUnitSelector(false);
  };

  const handleAddUnit = async () => {
    if (!selectedUnitToAdd) return;

    // Check if unit is already added
    if (selectedUnits.some(unit => unit.id === selectedUnitToAdd.id)) {
      alert('This unit has already been added');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, subUnits: true }));
      
      // Fetch sub-units for the selected unit
      const subUnitsResponse = await fetchSubUnitsForUnit(selectedUnitToAdd.id);
      const subUnitsData = subUnitsResponse.data?.data || subUnitsResponse.data || [];
      const subUnits = Array.isArray(subUnitsData) ? subUnitsData : subUnitsData.data || [];

      if (subUnits.length === 0) {
        alert('No sub-units found for this unit');
        return;
      }

      // Fetch things to check for each sub-unit and create checkpoints
      const subUnitsWithCheckpoints = await Promise.all(
        subUnits.map(async (subUnit: SubUnit) => {
          const thingsResponse = await fetchThingsToCheckForSubUnit(subUnit.id);
          const thingsData = thingsResponse.data?.data || thingsResponse.data || [];
          const thingsToCheck = Array.isArray(thingsData) ? thingsData : thingsData.data || [];

          const checkpoints: InspectionCheckpoint[] = thingsToCheck.map((thing: ThingToCheck) => ({
            id: thing.id,
            name: thing.things_to_check,
            condition: '',
            remarks: ''
          }));

          return {
            id: subUnit.id,
            name: subUnit.sub_unit_name,
            checkpoints
          };
        })
      );

      const newInspectionUnit: InspectionUnit = {
        id: selectedUnitToAdd.id,
        name: selectedUnitToAdd.name,
        subUnits: subUnitsWithCheckpoints
      };

      setSelectedUnits([...selectedUnits, newInspectionUnit]);
      setSelectedUnitToAdd(null);
      setExpandedUnit(selectedUnits.length);
    } catch (err) {
      console.error('Error adding unit:', err);
      setError('Failed to load unit details');
    } finally {
      setLoading(prev => ({ ...prev, subUnits: false }));
    }
  };

  const handleSubmit = () => {
    onComplete(selectedUnits);
  };

  if (loading.units || loading.conditions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-700">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-4 py-5 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Machine Unit Inspection</h3>
        <p className="text-sm text-blue-600 mb-4">
          Add units to inspect and set condition for each checkpoint. Add remarks for any observations.
        </p>
      </div>

      {selectedUnits.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">No units added yet. Click "Add Unit" to begin inspection.</p>
            </div>
          </div>
        </div>
      )}

      {selectedUnits.map((unit, unitIndex) => (
        <div key={unitIndex} className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className={`flex justify-between items-center p-4 cursor-pointer ${
              expandedUnit === unitIndex ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'
            }`}
            onClick={() => toggleUnit(unitIndex)}
          >
            <div className="flex items-center">
              <h3 className="text-base font-medium text-gray-900">{unit.name}</h3>
              {unit.subUnits.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {unit.subUnits.length} sub-unit{unit.subUnits.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center">
              {expandedUnit === unitIndex ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          
          {expandedUnit === unitIndex && (
            <div className="p-4 bg-white">
              {unit.subUnits.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  No sub-units available for this unit
                </div>
              ) : (
                unit.subUnits.map((subUnit, subUnitIndex) => (
                  <div key={subUnitIndex} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{subUnit.name}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                              Sno
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Things to be Checked
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Condition
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {subUnit.checkpoints.map((checkpoint, checkpointIndex) => (
                            <React.Fragment key={checkpoint.id}>
                              <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {checkpointIndex + 1}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {checkpoint.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={checkpoint.condition}
                                    onChange={(e) => handleConditionChange(
                                      unitIndex, 
                                      subUnitIndex, 
                                      checkpointIndex, 
                                      e.target.value
                                    )}
                                  >
                                    <option value="">Select Condition</option>
                                    {conditions.map((condition) => (
                                      <option key={condition.id} value={condition.name}>
                                        {condition.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => toggleRemark(unitIndex, subUnitIndex, checkpointIndex)}
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                      checkpoint.remarks
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                    {checkpoint.remarks ? 'Edit Remark' : 'Add Remark'}
                                  </button>
                                </td>
                              </tr>
                              {remarkOpen?.unitIndex === unitIndex && 
                               remarkOpen?.subUnitIndex === subUnitIndex && 
                               remarkOpen?.checkpointIndex === checkpointIndex && (
                                <tr className="bg-gray-50">
                                  <td colSpan={4} className="px-4 py-3">
                                    <div className="space-y-2">
                                      <label htmlFor={`remark-${unitIndex}-${subUnitIndex}-${checkpointIndex}`} className="block text-xs font-medium text-gray-700">
                                        Remark for {checkpoint.name}
                                      </label>
                                      <textarea
                                        id={`remark-${unitIndex}-${subUnitIndex}-${checkpointIndex}`}
                                        rows={3}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        placeholder="Add detailed observations..."
                                        value={checkpoint.remarks || ''}
                                        onChange={(e) => handleRemarkChange(unitIndex, subUnitIndex, checkpointIndex, e.target.value)}
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleRemark(unitIndex, subUnitIndex, checkpointIndex)}
                                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => toggleRemark(unitIndex, subUnitIndex, checkpointIndex)}
                                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                          Save Remark
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
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {/* Unit Selection Modal */}
      {showUnitSelector && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Unit to Add</h3>
              <button
                type="button"
                onClick={() => setShowUnitSelector(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-2">
              {units.filter(unit => !selectedUnits.some(u => u.id === unit.id)).map(unit => (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => handleUnitSelection(unit)}
                  className="w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {unit.name}
                </button>
              ))}
              {units.filter(unit => !selectedUnits.some(u => u.id === unit.id)).length === 0 && (
                <p className="text-sm text-gray-500">All available units have been added</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Selected Unit */}
      {selectedUnitToAdd && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Unit Addition</h3>
              <button
                type="button"
                onClick={() => setSelectedUnitToAdd(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4">Are you sure you want to add <strong>{selectedUnitToAdd.name}</strong> for inspection?</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedUnitToAdd(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddUnit}
                disabled={loading.subUnits}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.subUnits ? 'Adding...' : 'Add Unit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleAddUnitClick}
            disabled={selectedUnits.length >= units.length}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Unit
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedUnits.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default UnitInspection;