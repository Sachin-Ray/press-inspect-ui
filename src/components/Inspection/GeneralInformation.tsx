import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { fetchAllGeneralInfoQuestions } from '../../services/api';

interface Question {
  id: number;
  question: string;
  createdAt: string;
  updatedAt: string;
}

interface Answers {
  [key: number]: string;
}

interface GeneralInformationFormData {
  model_id: number;
  inspector_id: number;
  inspection_place: string;
  inspection_date: string;
  answers: Answers;
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
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      answers: {}
    }
  });
  
  // Get user data from localStorage
  console.log('Fetching user data from localStorage...');
  console.log('LocalStorage user data:', localStorage.getItem('user'));
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const inspectorId = userData.id || 0;
  const inspectorRole = userData.roles || 'Unknown';

  // Watch the answers object
  const answers = watch('answers') || {};

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('Fetching questions...');
        const response = await fetchAllGeneralInfoQuestions();
        console.log('API Response:', response);
        
        // Handle different response structures
        const questionsData = response.data?.data || response.data || [];
        
        console.log('Questions data:', questionsData);
        console.log('Number of questions:', questionsData.length);
        
        if (!Array.isArray(questionsData)) {
          throw new Error('Invalid questions data format');
        }
        
        setQuestions(questionsData);
      } catch (err) {
        console.error('Error details:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-700">Loading questions...</span>
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
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <h3 className="text-lg font-medium text-gray-900">
                General Questions ({questions.length})
              </h3>
              <svg
                className={`h-5 w-5 text-gray-500 transform transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`space-y-4 ${isAccordionOpen ? 'block' : 'hidden'}`}>
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

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Inspection Guidelines</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Answer all questions to the best of your knowledge</li>
                <li>For numeric values, provide the exact number if available</li>
                <li>Date and time should reflect when the inspection was actually performed</li>
                <li>Required fields are marked with an asterisk (*)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformation;