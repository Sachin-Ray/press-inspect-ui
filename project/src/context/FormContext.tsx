import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormState, FormData, FormOption, InspectionUnit } from '../types';
import { formData } from '../data/formData';

interface FormContextProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  availableGroups: FormOption[];
  availableModels: FormOption[];
  availableItems: FormOption[];
  availableYears: FormOption[];
  getInspectionUnits: () => InspectionUnit[];
  resetForm: () => void;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data] = useState<FormData>(formData);
  
  const [formState, setFormState] = useState<FormState>({
    group: '',
    model: '',
    item: '',
    year: ''
  });

  const [availableGroups, setAvailableGroups] = useState<FormOption[]>([]);
  const [availableModels, setAvailableModels] = useState<FormOption[]>([]);
  const [availableItems, setAvailableItems] = useState<FormOption[]>([]);
  const [availableYears, setAvailableYears] = useState<FormOption[]>([]);

  // Initialize available groups
  useEffect(() => {
    setAvailableGroups(data.groups);
  }, [data]);

  // Update available models when group changes
  useEffect(() => {
    if (formState.group) {
      setAvailableModels(data.models[formState.group] || []);
      setFormState(prev => ({ ...prev, model: '', item: '', year: '' }));
    } else {
      setAvailableModels([]);
    }
  }, [formState.group, data]);

  // Update available items when model changes
  useEffect(() => {
    if (formState.group && formState.model) {
      setAvailableItems(data.items[formState.group]?.[formState.model] || []);
      setFormState(prev => ({ ...prev, item: '', year: '' }));
    } else {
      setAvailableItems([]);
    }
  }, [formState.model, formState.group, data]);

  // Set available years
  useEffect(() => {
    if (formState.group) {
      setAvailableYears(data.years);
    } else {
      setAvailableYears([]);
    }
  }, [formState.group, data]);

  // Generate inspection units based on selection
  const getInspectionUnits = (): InspectionUnit[] => {
    // This would normally come from an API based on the selected machine
    // For demo purposes, we'll generate some example units

    if (!formState.group || !formState.model || !formState.item) {
      return [];
    }

    // Generate units based on the group
    const units: InspectionUnit[] = [];
    
    if (formState.group === 'Pre Press') {
      units.push({
        name: 'Plate Making Unit',
        checkpoints: generateCheckpoints('Plate Making Unit'),
        unitScore: 0
      });
      units.push({
        name: 'Imaging Unit',
        checkpoints: generateCheckpoints('Imaging Unit'),
        unitScore: 0
      });
    } else if (formState.group === 'Press') {
      units.push({
        name: 'Feeder Unit',
        checkpoints: generateCheckpoints('Feeder Unit'),
        unitScore: 0
      });
      units.push({
        name: 'Printing Unit',
        checkpoints: generateCheckpoints('Printing Unit'),
        unitScore: 0
      });
      units.push({
        name: 'Coating Unit',
        checkpoints: generateCheckpoints('Coating Unit'),
        unitScore: 0
      });
      units.push({
        name: 'Delivery Unit',
        checkpoints: generateCheckpoints('Delivery Unit'),
        unitScore: 0
      });
    } else if (formState.group === 'Post Press') {
      units.push({
        name: 'Cutting Unit',
        checkpoints: generateCheckpoints('Cutting Unit'),
        unitScore: 0
      });
      units.push({
        name: 'Folding Unit',
        checkpoints: generateCheckpoints('Folding Unit'),
        unitScore: 0
      });
    } else if (formState.group === 'Packaging') {
      units.push({
        name: 'Die Cutting Unit',
        checkpoints: generateCheckpoints('Die Cutting Unit'),
        unitScore: 0
      });
      units.push({
        name: 'Foiling Unit',
        checkpoints: generateCheckpoints('Foiling Unit'),
        unitScore: 0
      });
    }
    
    return units;
  };

  // Helper to generate checkpoints
  const generateCheckpoints = (unitName: string) => {
    // In a real app, these would come from the backend based on the machine type
    const baseCheckpoints = [
      { id: '1', name: 'Component alignment', status: null },
      { id: '2', name: 'Motor functionality', status: null },
      { id: '3', name: 'Safety mechanisms', status: null },
      { id: '4', name: 'Calibration accuracy', status: null },
      { id: '5', name: 'Wear and tear assessment', status: null }
    ];
    
    // Add unit-specific checkpoints
    if (unitName === 'Feeder Unit') {
      return [
        ...baseCheckpoints,
        { id: '6', name: 'Paper feed mechanism', status: null },
        { id: '7', name: 'Sheet separation', status: null },
        { id: '8', name: 'Feed table condition', status: null }
      ];
    } else if (unitName === 'Printing Unit') {
      return [
        ...baseCheckpoints,
        { id: '6', name: 'Blanket condition', status: null },
        { id: '7', name: 'Impression cylinder', status: null },
        { id: '8', name: 'Ink distribution', status: null }
      ];
    } else if (unitName === 'Delivery Unit') {
      return [
        ...baseCheckpoints,
        { id: '6', name: 'Sheet delivery chains', status: null },
        { id: '7', name: 'Anti-marking system', status: null },
        { id: '8', name: 'Pile formation', status: null }
      ];
    }
    
    return baseCheckpoints;
  };

  // Reset form state
  const resetForm = () => {
    setFormState({
      group: '',
      model: '',
      item: '',
      year: ''
    });
  };

  return (
    <FormContext.Provider
      value={{
        formState,
        setFormState,
        availableGroups,
        availableModels,
        availableItems,
        availableYears,
        getInspectionUnits,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};