import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../context/FormContext';
import { useReport } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ArrowRight, Info, Save } from 'lucide-react';
import MachineSelection from './MachineSelection';
import GeneralInformation from './GeneralInformation';
import UnitInspection from './UnitInspection';
import InspectionSummary from './InspectionSummary';

const InspectionForm: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { formState, resetForm } = useForm();
  const { 
    createReport, 
    currentReport, 
    calculateScores, 
    saveReport 
  } = useReport();
  
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step === 1 && !formState.machineId) {
      alert('Please select a machine');
      return;
    }
    
    if (step === 4) {
      calculateScores();
    }
    
    if (step === 3 && !currentReport) {
      createReport({
        userId: state.user?.id || '',
        inspectorName: state.user?.name || '',
        registrationId: state.user?.registrationId || 'N/A',
        group: formState.machineDetails?.group?.name || '',
        model: formState.machineName,
        item: formState.machineDetails?.serial_number || '',
        year: formState.machineDetails?.year !== undefined ? String(formState.machineDetails.year) : '',
        date: formState.customerInfo.date,
        location: formState.customerInfo.location,
        customerName: formState.customerInfo.customerName,
        customerEmail: formState.customerInfo.customerEmail,
        customerPhone: formState.customerInfo.customerPhone,
        units: formState.units,
        comments: ''
      });
    }
    
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = () => {
    calculateScores();
    saveReport();
    resetForm();
    navigate('/reports');
  };
  
  const renderProgressSteps = () => {
    const steps = [
      'Machine Selection',
      'General Information',
      'Unit Inspection',
      'Summary'
    ];
    
    return (
      <div className="w-full py-6">
        <div className="flex items-center">
          {steps.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center relative">
                <div 
                  className={`h-12 w-12 rounded-full border-2 flex items-center justify-center ${
                    step > i + 1 
                      ? 'bg-[#0F52BA] border-[#0F52BA] text-white' 
                      : step === i + 1 
                      ? 'border-[#0F52BA] text-[#0F52BA]' 
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {step > i + 1 ? (
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
                    step > i + 2 ? 'border-[#0F52BA]' : 'border-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <MachineSelection />;
      case 2:
        return (
          <GeneralInformation
            selectedModelName={formState.machineName || 'Unknown Machine'}
            selectedModelId={formState.machineId || 0}
            onComplete={() => nextStep()}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <UnitInspection
            initialUnits={formState.units}
            onBack={prevStep}
            onComplete={() => nextStep()}
          />
        );
      case 4:
  return (
    <InspectionSummary 
      report={currentReport as any} 
      questions={formState.generalInfo.questions?.map(q => ({
        id: q.id,
        question: q.text
      }))} // Pass the questions in expected format
    />
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