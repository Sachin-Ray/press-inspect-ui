import React, { createContext, useContext, useState, useEffect } from 'react';
import { InspectionReport, InspectionUnit, Checkpoint } from '../types';
import { useAuth } from './AuthContext';

interface ReportContextProps {
  reports: InspectionReport[];
  currentReport: InspectionReport | null;
  createReport: (report: Omit<InspectionReport, 'id' | 'createdAt' | 'overallScore' | 'overallRating'>) => void;
  getReportById: (id: string) => InspectionReport | null;
  updateCheckpointStatus: (unitIndex: number, checkpointIndex: number, status: 'Excellent' |'Good' | 'Bad' | 'Better') => void;
  updateCheckpointComment: (unitIndex: number, checkpointIndex: number, comment: string) => void;
  calculateScores: () => void;
  saveReport: () => void;
  resetCurrentReport: () => void;
}

const ReportContext = createContext<ReportContextProps | undefined>(undefined);

// Mock implementation for demo purposes
export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [currentReport, setCurrentReport] = useState<InspectionReport | null>(null);

  // Load demo reports on first render
  useEffect(() => {
    // In a real app, you would fetch this from an API
    const demoReports: InspectionReport[] = [
      {
        id: '1',
        userId: '1',
        inspectorName: 'Admin User',
        registrationId: 'ADM001',
        group: 'Press',
        model: 'SM52',
        item: 'SM52 - 4',
        year: '2006 - 2010',
        date: '2024-05-10',
        location: 'Berlin, Germany',
        customerName: 'PrintMaster GmbH',
        customerEmail: 'info@printmaster.de',
        customerPhone: '+49 123 456789',
        units: [
          {
            name: 'Feeder Unit',
            checkpoints: [
              { id: '1', name: 'Component alignment', status: 'Good' },
              { id: '2', name: 'Motor functionality', status: 'Good' },
              { id: '3', name: 'Safety mechanisms', status: 'Better' }
            ],
            unitScore: 90
          },
          {
            name: 'Printing Unit',
            checkpoints: [
              { id: '4', name: 'Blanket condition', status: 'Good' },
              { id: '5', name: 'Ink distribution', status: 'Bad' },
              { id: '6', name: 'Impression pressure', status: 'Good' }
            ],
            unitScore: 70
          }
        ],
        overallScore: 80,
        overallRating: 'Good',
        comments: 'Machine is in good condition overall, but ink distribution system needs attention.',
        createdAt: '2024-05-10T10:30:00Z'
      },
      {
        id: '2',
        userId: '3',
        inspectorName: 'Press Inspector',
        registrationId: 'PR001',
        group: 'Press',
        model: 'CD102',
        item: 'CD102 - 4',
        year: '2011 - 2015',
        date: '2024-05-08',
        location: 'Chicago, USA',
        customerName: 'American Print Solutions',
        customerEmail: 'service@apsolutions.com',
        customerPhone: '+1 312 555 1234',
        units: [
          {
            name: 'Feeder Unit',
            checkpoints: [
              { id: '1', name: 'Component alignment', status: 'Good' },
              { id: '2', name: 'Motor functionality', status: 'Better' },
              { id: '3', name: 'Safety mechanisms', status: 'Good' }
            ],
            unitScore: 90
          },
          {
            name: 'Printing Unit',
            checkpoints: [
              { id: '4', name: 'Blanket condition', status: 'Good' },
              { id: '5', name: 'Ink distribution', status: 'Good' },
              { id: '6', name: 'Impression pressure', status: 'Good' }
            ],
            unitScore: 90
          }
        ],
        overallScore: 90,
        overallRating: 'Good',
        comments: 'Excellent machine condition. Regular maintenance has been performed.',
        createdAt: '2024-05-08T15:45:00Z'
      }
    ];

    setReports(demoReports);
  }, []);

  // Create a new report
  const createReport = (reportData: Omit<InspectionReport, 'id' | 'createdAt' | 'overallScore' | 'overallRating'>) => {
    // In a real app, you would send this to an API
    const newReport: InspectionReport = {
      ...reportData,
      id: `${Date.now()}`, // Generate a unique ID
      createdAt: new Date().toISOString(),
      overallScore: 0,
      overallRating: 'Not Good' // Default rating until calculated
    };
    
    setCurrentReport(newReport);
  };

  // Get a report by ID
  const getReportById = (id: string) => {
    return reports.find(report => report.id === id) || null;
  };

  // Update checkpoint status
  const updateCheckpointStatus = (unitIndex: number, checkpointIndex: number, status: 'Good' | 'Bad' | 'Better') => {
    if (!currentReport) return;

    const updatedUnits = [...currentReport.units];
    updatedUnits[unitIndex].checkpoints[checkpointIndex].status = status;

    setCurrentReport({
      ...currentReport,
      units: updatedUnits
    });
  };

  // Update checkpoint comment
  const updateCheckpointComment = (unitIndex: number, checkpointIndex: number, comment: string) => {
    if (!currentReport) return;

    const updatedUnits = [...currentReport.units];
    updatedUnits[unitIndex].checkpoints[checkpointIndex].comments = comment;

    setCurrentReport({
      ...currentReport,
      units: updatedUnits
    });
  };

  // Calculate scores for all units and overall
  const calculateScores = () => {
    if (!currentReport) return;

    const updatedUnits = currentReport.units.map(unit => {
      const checkpoints = unit.checkpoints;
      let totalPoints = 0;
      let totalCheckpoints = 0;

      checkpoints.forEach(checkpoint => {
        if (checkpoint.status) {
          totalCheckpoints++;
          if (checkpoint.status === 'Good') totalPoints += 80;
          else if (checkpoint.status === 'Better') totalPoints += 100;
          else if (checkpoint.status === 'Bad') totalPoints += 40;
        }
      });

      const unitScore = totalCheckpoints > 0 ? Math.round(totalPoints / totalCheckpoints) : 0;

      return {
        ...unit,
        unitScore
      };
    });

    // Calculate overall score as average of unit scores
    const totalUnitScores = updatedUnits.reduce((sum, unit) => sum + unit.unitScore, 0);
    const overallScore = updatedUnits.length > 0 ? Math.round(totalUnitScores / updatedUnits.length) : 0;

    // Determine rating based on score
    let overallRating: 'Good' | 'Average' | 'Not Good';
    if (overallScore >= 70) {
      overallRating = 'Good';
    } else if (overallScore >= 50) {
      overallRating = 'Average';
    } else {
      overallRating = 'Not Good';
    }

    setCurrentReport({
      ...currentReport,
      units: updatedUnits,
      overallScore,
      overallRating
    });
  };

  // Save the current report
  const saveReport = () => {
    if (!currentReport) return;

    // Calculate final scores before saving
    calculateScores();

    // In a real app, you would send this to an API
    setReports(prevReports => [currentReport, ...prevReports]);
  };

  // Reset the current report
  const resetCurrentReport = () => {
    setCurrentReport(null);
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        currentReport,
        createReport,
        getReportById,
        updateCheckpointStatus,
        updateCheckpointComment,
        calculateScores,
        saveReport,
        resetCurrentReport
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};