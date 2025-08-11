import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { fetchAllConditionsName, fetchAllGeneralInfoQuestions, fetchAllStationsName, fetchAllColorMeasurements } from '../../services/api';

interface Question {
  id: number;
  question: string;
  createdAt: string;
  updatedAt: string;
}

interface ControlStation {
  id: number;
  station_name: string;
  thingToChecks: ThingToCheck[];
}

interface ThingToCheck {
  id: number;
  things_to_check: string;
  control_station_id: number;
}

interface Condition {
  id: number;
  name: string;
}

interface ColorMeasurement {
  id: number;
  device_name: string;
}

interface Answers {
  [key: number]: string;
}

interface ControlStationData {
  stationId: number | null;
  modelType: string;
  checks: {
    [checkId: number]: {
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

interface GeneralInformationFormData {
  model_id: number;
  inspector_id: number;
  inspection_place: string;
  inspection_date: string;
  answers: Answers;
  controlStation: ControlStationData;
  colorMeasurement: ColorMeasurementData;
}

interface GeneralInformationProps {
  selectedModelName: string;
  selectedModelId: number;
  onComplete: (data: GeneralInformationFormData) => void;
  onBack: () => void;
}

const GeneralInformation: React.FC<GeneralInformationProps> = ({ 
  selectedModelName, 
  selectedModelId, 
  onComplete,
  onBack 
}) => {
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const [isControlStationOpen, setIsControlStationOpen] = useState(true);
  const [isColorMeasurementOpen, setIsColorMeasurementOpen] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [controlStations, setControlStations] = useState<ControlStation[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [colorMeasurements, setColorMeasurements] = useState<ColorMeasurement[]>([]);
  const [loading, setLoading] = useState({
    questions: true,
    stations: true,
    conditions: true,
    colorMeasurements: true
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<ControlStation | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    watch
  } = useForm<GeneralInformationFormData>({
    defaultValues: {
      model_id: selectedModelId,
      inspector_id: 0,
      inspection_place: '',
      inspection_date: '',
      answers: {},
      controlStation: {
        stationId: null,
        modelType: '',
        checks: {}
      },
      colorMeasurement: {
        deviceId: null,
        version: '',
        deviceCondition: '',
        deviceComments: '',
        calibrationStatus: '',
        calibrationComments: ''
      }
    }
  });
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const inspectorId = userData.id || 0;
  const inspectorRole = userData.roles || 'Unknown';

  // Watch the form data
  const answers = watch('answers') || {};
  const controlStationData = watch('controlStation') || { stationId: null, modelType: '', checks: {} };
  const colorMeasurementData = watch('colorMeasurement') || {
    deviceId: null,
    version: '',
    deviceCondition: '',
    deviceComments: '',
    calibrationStatus: '',
    calibrationComments: ''
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch questions
        const questionsResponse = await fetchAllGeneralInfoQuestions();
        const questionsData = questionsResponse.data?.data || questionsResponse.data || [];
        setQuestions(questionsData);

        // Fetch control stations
        const stationsResponse = await fetchAllStationsName();
        const stationsData = stationsResponse.data?.data || stationsResponse.data || [];
        setControlStations(stationsData);

        // Fetch conditions
        const conditionsResponse = await fetchAllConditionsName();
        const conditionsData = conditionsResponse.data?.data || conditionsResponse.data || [];
        setConditions(conditionsData);

        // Fetch color measurements
        const colorResponse = await fetchAllColorMeasurements();
        const colorData = colorResponse.data?.data || colorResponse.data || [];
        setColorMeasurements(colorData);

        setLoading({
          questions: false,
          stations: false,
          conditions: false,
          colorMeasurements: false
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error connecting to server');
        setLoading({
          questions: false,
          stations: false,
          conditions: false,
          colorMeasurements: false
        });
      }
    };

    fetchData();
  }, [setValue]);

  useEffect(() => {
    setValue('inspector_id', inspectorId);
  }, [inspectorId, setValue]);

  const onSubmit: SubmitHandler<GeneralInformationFormData> = (data) => {
    const completeData = {
      ...data,
      model_id: selectedModelId,
      inspector_id: inspectorId,
    };
    onComplete(completeData);
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: value
    };
    setValue('answers', updatedAnswers);
  };

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stationId = parseInt(e.target.value);
    const station = controlStations.find(s => s.id === stationId) || null;
    setSelectedStation(station);
    
    // Update form data
    setValue('controlStation.stationId', stationId);
    setValue('controlStation.modelType', '');
    setValue('controlStation.checks', {});
  };

  const handleModelTypeChange = (modelType: string) => {
    setValue('controlStation.modelType', modelType);
  };

  const handleConditionChange = (checkId: number, condition: string) => {
    const updatedChecks = {
      ...controlStationData.checks,
      [checkId]: {
        ...(controlStationData.checks[checkId] || {}),
        condition
      }
    };
    setValue('controlStation.checks', updatedChecks);
  };

  const handleRemarksChange = (checkId: number, remarks: string) => {
    const updatedChecks = {
      ...controlStationData.checks,
      [checkId]: {
        ...(controlStationData.checks[checkId] || {}),
        remarks
      }
    };
    setValue('controlStation.checks', updatedChecks);
  };

  const handleColorDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = parseInt(e.target.value);
    setValue('colorMeasurement.deviceId', deviceId);
  };

  const handleColorVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('colorMeasurement.version', e.target.value);
  };

  const handleDeviceConditionChange = (value: string) => {
    setValue('colorMeasurement.deviceCondition', value);
  };

  const handleDeviceCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('colorMeasurement.deviceComments', e.target.value);
  };

  const handleCalibrationStatusChange = (value: string) => {
    setValue('colorMeasurement.calibrationStatus', value);
  };

  const handleCalibrationCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('colorMeasurement.calibrationComments', e.target.value);
  };

  const isLoading = loading.questions || loading.stations || loading.conditions || loading.colorMeasurements;

  if (isLoading) {
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
    <div className="space-y-6 mx-auto p-4">
      <div className="px-6 py-6 bg-white shadow rounded-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">General Information</h2>
          <p className="mt-1 text-sm text-gray-500">
            Please provide the general information about the inspection.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Model and Inspector Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Model
              </label>
              <input
                type="text"
                value={selectedModelName}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspector Role
              </label>
              <input
                type="text"
                value={inspectorRole}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2"
              />
            </div>
          </div>

          {/* Inspection Place and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="inspection_place" className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Place*
              </label>
              <input
                id="inspection_place"
                {...register("inspection_place", { required: "Inspection place is required" })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                placeholder="Enter inspection location"
              />
              {errors.inspection_place && (
                <p className="mt-1 text-sm text-red-600">{errors.inspection_place.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="inspection_date" className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Date*
              </label>
              <input
                type="datetime-local"
                id="inspection_date"
                {...register("inspection_date", { required: "Inspection date is required" })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
              {errors.inspection_date && (
                <p className="mt-1 text-sm text-red-600">{errors.inspection_date.message}</p>
              )}
            </div>
          </div>

          {/* Questions Section with Accordion */}
          <div className="space-y-6">
            <button
              type="button"
              className="w-full flex justify-between items-center pb-2 border-b border-gray-200"
              onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
            >
              <h3 className="text-lg font-medium text-gray-900">
                General Questions ({questions.length})
              </h3>
              <svg
                className={`h-5 w-5 text-gray-500 transform transition-transform ${isQuestionsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`space-y-4 ${isQuestionsOpen ? 'block' : 'hidden'}`}>
              {questions.map((question) => (
                <div key={question.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    {question.question}
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                      placeholder="Enter your answer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Stations Section */}
          <div className="space-y-6">
            <button
              type="button"
              className="w-full flex justify-between items-center pb-2 border-b border-gray-200"
              onClick={() => setIsControlStationOpen(!isControlStationOpen)}
            >
              <h3 className="text-lg font-medium text-gray-900">
                Control Station
              </h3>
              <svg
                className={`h-5 w-5 text-gray-500 transform transition-transform ${isControlStationOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`space-y-4 ${isControlStationOpen ? 'block' : 'hidden'}`}>
              {/* Control Station Dropdown */}
              <div>
                <label htmlFor="controlStation" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Control Station*
                </label>
                <select
                  id="controlStation"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  value={selectedStation?.id || ''}
                  onChange={handleStationChange}
                >
                  <option value="">Select a control station</option>
                  {controlStations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.station_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Type Selection (only shown when station is selected) */}
              {selectedStation && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Model Type:</span>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="modelType"
                      value="Flash card"
                      checked={controlStationData.modelType === 'Flash card'}
                      onChange={() => handleModelTypeChange('Flash card')}
                    />
                    <span className="ml-2">Flash card</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="modelType"
                      value="USB"
                      checked={controlStationData.modelType === 'USB'}
                      onChange={() => handleModelTypeChange('USB')}
                    />
                    <span className="ml-2">USB</span>
                  </label>
                </div>
              )}

              {/* Things to Check Table (only shown when station is selected) */}
              {selectedStation && selectedStation.thingToChecks.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Things to be Checked</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedStation.thingToChecks.map((check) => (
                        <tr key={check.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {check.things_to_check}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={controlStationData.checks[check.id]?.condition || ''}
                              onChange={(e) => handleConditionChange(check.id, e.target.value)}
                            >
                              <option value="">Select condition</option>
                              {conditions.map((condition) => (
                                <option key={condition.id} value={condition.name}>
                                  {condition.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                              type="text"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={controlStationData.checks[check.id]?.remarks || ''}
                              onChange={(e) => handleRemarksChange(check.id, e.target.value)}
                              placeholder="Enter remarks"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Color Measuring Device Section */}
          <div className="space-y-6">
            <button
              type="button"
              className="w-full flex justify-between items-center pb-2 border-b border-gray-200"
              onClick={() => setIsColorMeasurementOpen(!isColorMeasurementOpen)}
            >
              <h3 className="text-lg font-medium text-gray-900">
                Color Measuring Device
              </h3>
              <svg
                className={`h-5 w-5 text-gray-500 transform transition-transform ${isColorMeasurementOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`space-y-4 ${isColorMeasurementOpen ? 'block' : 'hidden'}`}>
              {/* Device Selection */}
              <div>
                <label htmlFor="colorDevice" className="block text-sm font-medium text-gray-700 mb-1">
                  Color Measuring Device
                </label>
                <select
                  id="colorDevice"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  value={colorMeasurementData.deviceId || ''}
                  onChange={handleColorDeviceChange}
                >
                  <option value="">Select a device</option>
                  {colorMeasurements.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.device_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version of the device */}
              <div>
                <label htmlFor="deviceVersion" className="block text-sm font-medium text-gray-700 mb-1">
                  Version of the device
                </label>
                <input
                  type="text"
                  id="deviceVersion"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  value={colorMeasurementData.version || ''}
                  onChange={handleColorVersionChange}
                  placeholder="Enter device version"
                />
              </div>

              {/* Device Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Condition
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="deviceCondition"
                      value="Working"
                      checked={colorMeasurementData.deviceCondition === 'Working'}
                      onChange={() => handleDeviceConditionChange('Working')}
                    />
                    <span className="ml-2">Working</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="deviceCondition"
                      value="Not Working"
                      checked={colorMeasurementData.deviceCondition === 'Not Working'}
                      onChange={() => handleDeviceConditionChange('Not Working')}
                    />
                    <span className="ml-2">Not Working</span>
                  </label>
                </div>
              </div>

              {/* Device Comments */}
              <div>
                <label htmlFor="deviceComments" className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <input
                  type="text"
                  id="deviceComments"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  value={colorMeasurementData.deviceComments || ''}
                  onChange={handleDeviceCommentsChange}
                  placeholder="Enter comments"
                />
              </div>

              {/* Expiry of Calibration Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry of Calibration Card
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="calibrationStatus"
                      value="Expired"
                      checked={colorMeasurementData.calibrationStatus === 'Expired'}
                      onChange={() => handleCalibrationStatusChange('Expired')}
                    />
                    <span className="ml-2">Expired</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="calibrationStatus"
                      value="Not Expired"
                      checked={colorMeasurementData.calibrationStatus === 'Not Expired'}
                      onChange={() => handleCalibrationStatusChange('Not Expired')}
                    />
                    <span className="ml-2">Not Expired</span>
                  </label>
                </div>
              </div>

              {/* Calibration Comments */}
              <div>
                <label htmlFor="calibrationComments" className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <input
                  type="text"
                  id="calibrationComments"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  value={colorMeasurementData.calibrationComments || ''}
                  onChange={handleCalibrationCommentsChange}
                  placeholder="Enter comments"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralInformation;