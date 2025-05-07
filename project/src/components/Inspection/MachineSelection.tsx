import React from 'react';
import { useForm } from '../../context/FormContext';

const MachineSelection: React.FC = () => {
  const { 
    formState, 
    setFormState,
    availableGroups,
    availableModels,
    availableItems,
    availableYears
  } = useForm();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="px-4 py-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Machine Selection</h3>
        <p className="text-sm text-blue-600 mb-4">
          Select the machine details to begin the inspection report.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Group Selection */}
          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
              Group*
            </label>
            <select
              id="group"
              name="group"
              value={formState.group}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Group</option>
              {availableGroups.map(group => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model*
            </label>
            <select
              id="model"
              name="model"
              value={formState.model}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!formState.group}
              required
            >
              <option value="">Select Model</option>
              {availableModels.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Item Selection */}
          <div>
            <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-1">
              Item*
            </label>
            <select
              id="item"
              name="item"
              value={formState.item}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!formState.model}
              required
            >
              <option value="">Select Item</option>
              {availableItems.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Year Selection */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year Range*
            </label>
            <select
              id="year"
              name="year"
              value={formState.year}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!formState.group}
              required
            >
              <option value="">Select Year Range</option>
              {availableYears.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {formState.group && formState.model && formState.item && formState.year && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selection Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Group</p>
              <p className="text-sm font-medium">{formState.group}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Model</p>
              <p className="text-sm font-medium">{formState.model}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Item</p>
              <p className="text-sm font-medium">{formState.item}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Year Range</p>
              <p className="text-sm font-medium">{formState.year}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineSelection;