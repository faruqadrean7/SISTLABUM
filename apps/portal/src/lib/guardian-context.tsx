'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CURRENT_GUARDIAN, 
  GuardianChildProfile, 
  GuardianProfile,
  MOCK_CHILD_GRADES,
  MOCK_GUARDIAN_ATTENDANCE,
  MOCK_CHILD_POINTS,
  MOCK_GUARDIAN_FEES,
  ChildSubjectGrade,
  AttendanceCalendarDay,
  ChildPointItem,
  SchoolFeeItem
} from './mock-guardian-data';

interface GuardianContextType {
  guardian: GuardianProfile;
  activeChild: GuardianChildProfile;
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  activeGrades: ChildSubjectGrade[];
  activeAttendance: AttendanceCalendarDay[];
  activePoints: ChildPointItem[];
  activeFees: SchoolFeeItem[];
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export function GuardianProvider({ children }: { children: React.ReactNode }) {
  const [activeChildId, setActiveChildIdState] = useState<string>(CURRENT_GUARDIAN.children[0].id);

  // Sync with localStorage on client mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChildId = localStorage.getItem('sistlabum_guardian_active_child');
      if (savedChildId && CURRENT_GUARDIAN.children.some(c => c.id === savedChildId)) {
        setActiveChildIdState(savedChildId);
      }
    }
  }, []);

  const setActiveChildId = (id: string) => {
    setActiveChildIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sistlabum_guardian_active_child', id);
    }
  };

  const activeChild = CURRENT_GUARDIAN.children.find(c => c.id === activeChildId) || CURRENT_GUARDIAN.children[0];
  const activeGrades = MOCK_CHILD_GRADES[activeChild.id] || [];
  const activeAttendance = MOCK_GUARDIAN_ATTENDANCE[activeChild.id] || [];
  const activePoints = MOCK_CHILD_POINTS[activeChild.id] || [];
  const activeFees = MOCK_GUARDIAN_FEES[activeChild.id] || [];

  return (
    <GuardianContext.Provider
      value={{
        guardian: CURRENT_GUARDIAN,
        activeChild,
        activeChildId,
        setActiveChildId,
        activeGrades,
        activeAttendance,
        activePoints,
        activeFees,
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
}

export function useGuardian() {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error('useGuardian must be used within a GuardianProvider');
  }
  return context;
}
