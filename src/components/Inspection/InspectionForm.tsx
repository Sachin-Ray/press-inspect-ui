import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../context/FormContext';
import { useReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ArrowRight, Info, Save } from 'lucide-react';
import CustomerInfoForm from './CustomerInfoForm';
import MachineSelection from './MachineSelection';
import UnitInspection from './UnitInspection';
import InspectionSummary from './InspectionSummary';

const InspectionForm: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { formState, getInspectionUnits, resetForm } = useForm();
  const { createReport, currentReport, updateCheckpointStatus, updateCheckpointComment, calculateScores, saveReport } = useReport();
  
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Handle step changes
  const nextStep = () => {
    if (step === 1) {
      // Validate machine selection
      if (!formState.machineId) {
        alert('Please selection the Machine');
        return;
      }
    } else if (step === 2) {
      // Validate customer info
      if (!customerInfo.customerName || !customerInfo.location) {
        alert('Customer name and location are required');
        return;
      }
    } else if (step === 3) {
      // Calculate scores before showing summary
      calculateScores();
    }
    
    // If proceeding from step 2, create the report
    if (step === 2 && !currentReport) {
      const units = getInspectionUnits();
      
      if (!state.user) {
        alert('User information is missing');
        return;
      }
      
      createReport({
        userId: state.user.id,
        inspectorName: state.user.name,
        registrationId: state.user.registrationId || 'N/A',
        group: formState.group,
        model: formState.model,
        item: formState.item,
        year: formState.year,
        date: customerInfo.date,
        location: customerInfo.location,
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        customerPhone: customerInfo.customerPhone,
        units,
        comments: ''
      });
    }
    
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  // Handle final submission
  const handleSubmit = () => {
    calculateScores();
    saveReport();
    resetForm();
    navigate('/reports');
  };
  
  // Render progress steps
  const renderProgressSteps = () => {
    const steps = ['Machine Selection', 'Customer Info', 'Inspection', 'Summary'];
    
    return (
      <div className="w-full py-6">
        <div className="flex items-center">
          {steps.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center relative">
                <div 
                  className={`h-12 w-12 rounded-full border-2 flex items-center justify-center ${
                    step > i 
                      ? 'bg-[#0F52BA] border-[#0F52BA] text-white' 
                      : step === i + 1 
                      ? 'border-[#0F52BA] text-[#0F52BA]' 
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {step > i ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <div 
                  className={`absolute -bottom-6 text-xs w-max text-center -ml-6 ${
                    step >= i + 1 ? 'text-[#0F52BA] font-medium' : 'text-gray-500'
                  }`}
                  style={{ left: '50%' }}
                >
                  {label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div 
                  className={`flex-auto border-t-2 ${
                    step > i + 1 ? 'border-[#0F52BA]' : 'border-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <MachineSelection />;
      case 2:
        return (
          <CustomerInfoForm 
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
          />
        );
      case 3:
        return currentReport ? (
          <UnitInspection
            units={currentReport.units}
            updateStatus={updateCheckpointStatus}
            updateComment={updateCheckpointComment}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Error: Report data not found</p>
          </div>
        );
      case 4:
        return currentReport ? (
          <InspectionSummary report={currentReport} />
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Error: Report data not found</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Inspection Report</h1>
        <div className="flex items-center text-sm text-gray-600">
          <Info className="h-4 w-4 mr-1" />
          <span>
            {state.user?.roles.replace('_', ' ').toUpperCase()} / {state.user?.registrationId || 'N/A'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          {renderProgressSteps()}
        </div>
        
        <div className="p-6">
          {renderStepContent()}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-4 py-2 bg-[#0F52BA] text-white font-medium rounded-md hover:bg-blue-700"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Submit Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionForm;