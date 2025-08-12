import React, { createContext, useContext, useState, useEffect } from 'react';

interface MachineDetails {
  id: number;
  name: string;
  serial_number: string;
  total_impressions: string;
  manufacturer: string;
  year: number;
  group: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    company_name: string;
    address: string;
  };
  buyer: {
    id: number;
    company_name: string;
    address: string;
  };
}

interface ControlStationData {
  stationId: number | null;
  modelType: string;
  checks: {
    [checkId: number]: {
      thingToCheck: string;
      condition: string;
      remarks: string;
    };
  };
}

interface ColorMeasurementData {
  deviceId: number | null;
  version: string;
  deviceCondition: string;
  deviceComments: string;
  calibrationStatus: string;
  calibrationComments: string;
}

interface Question {
  id: number;
  text: string;
  type?: string;
  options?: string[];
}

interface FormState {
  // Machine Selection
  machineId: number | null;
  machineName: string;
  machineDetails: MachineDetails | null;
  
  // General Information
   generalInfo: {
    inspectionPlace: string;
    inspectionDate: string;
    answers: Record<number, string>;
    controlStation: ControlStationData | null;
    colorMeasurement: ColorMeasurementData | null;
    questions: Question[]; // Add this
  };
  
  // Unit Inspection
  units: any[];
  
  // Customer Information
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    location: string;
    date: string;
  };
}

interface FormContextType {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const FormProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inspectionFormData');
      return saved ? JSON.parse(saved) : {
        machineId: null,
        machineName: '',
        machineDetails: null,
        generalInfo: {
          inspectionPlace: '',
          inspectionDate: '',
          answers: {},
          controlStation: null,
          colorMeasurement: null,
          questions: []
        },
        units: [],
        customerInfo: {
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          location: '',
          date: new Date().toISOString().split('T')[0]
        }
      };
    }
    return {
      machineId: null,
      machineName: '',
      machineDetails: null,
      generalInfo: {
        inspectionPlace: '',
        inspectionDate: '',
        answers: {},
        controlStation: null,
        colorMeasurement: null,
        questions: []
      },
      units: [],
      customerInfo: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        location: '',
        date: new Date().toISOString().split('T')[0]
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('inspectionFormData', JSON.stringify(formState));
  }, [formState]);

  const resetForm = () => {
    setFormState({
      machineId: null,
      machineName: '',
      machineDetails: null,
      generalInfo: {
        inspectionPlace: '',
        inspectionDate: '',
        answers: {},
        controlStation: null,
        colorMeasurement: null,
        questions: []
      },
      units: [],
      customerInfo: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        location: '',
        date: new Date().toISOString().split('T')[0]
      }
    });
    localStorage.removeItem('inspectionFormData');
  };

  return (
    <FormContext.Provider value={{ formState, setFormState, resetForm }}>
      {children}
    </FormContext.Provider>
  );
};

const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

export { FormProvider, useForm };