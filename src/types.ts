// src/types.ts
export interface Machine {
  id: number;
  name: string;
  serial_number: string;
  total_impressions: string;
  manufacturer: string;
  year: number;
  group_id: number;
  seller_id: number;
  buyer_id: number;
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
  technicalSpecification: {
    id: number;
    model_id: number;
    date_of_upload: string;
    pdf: string;
    file_name: string | null;
  } | null;
}

export interface Question {
  id: number;
  question: string;
  createdAt: string;
  updatedAt: string;
}

export interface ControlStation {
  id: number;
  station_name: string;
  thingToChecks: ThingToCheck[];
}

export interface ThingToCheck {
  id: number;
  things_to_check: string;
  control_station_id: number;
}

export interface Condition {
  id: number;
  name: string;
}

export interface ColorMeasurement {
  id: number;
  device_name: string;
}

export interface ControlStationData {
  stationId: number | null;
  modelType: string;
  checks: {
    [checkId: number]: {
      condition: string;
      remarks: string;
    };
  };
}

export interface ColorMeasurementData {
  deviceId: number | null;
  version: string;
  deviceCondition: string;
  deviceComments: string;
  calibrationStatus: string;
  calibrationComments: string;
}

export interface GeneralInfo {
  model_id: number;
  inspector_id: number;
  inspection_place: string;
  inspection_date: string;
  answers: Record<number, string>;
  controlStation: ControlStationData;
  colorMeasurement: ColorMeasurementData;
}

export interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  date: string;
}

export interface InspectionCheckpoint {
  id: number;
  name: string;
  condition: string;
  remarks: string;
}

export interface InspectionSubUnit {
  id: number;
  name: string;
  checkpoints: InspectionCheckpoint[];
}

export interface InspectionUnit {
  id: number;
  name: string;
  subUnits: InspectionSubUnit[];
}

export interface FormState {
  machineId: number | null;
  machineName: string;
  machineDetails: Machine | null;
  generalInfo: GeneralInfo | null;
  inspectionUnits: InspectionUnit[];
  customerInfo: CustomerInfo | null;
}