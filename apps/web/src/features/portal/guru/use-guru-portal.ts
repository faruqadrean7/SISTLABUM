import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guruApi } from './guru-api';
import {
  TeacherAttendanceSessionPayload,
  TeacherJournalItem,
  TeacherMaterialItem,
  TeacherAssignmentItem,
  TeacherStudentGrade,
} from './types';

export function useTeacherClasses() {
  return useQuery({
    queryKey: ['guru', 'classes'],
    queryFn: () => guruApi.getTeacherClasses(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherSchedules() {
  return useQuery({
    queryKey: ['guru', 'schedules'],
    queryFn: () => guruApi.getTeacherSchedules(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAttendanceStudents(classId: string) {
  return useQuery({
    queryKey: ['guru', 'attendance-students', classId],
    queryFn: () => guruApi.getAttendanceStudents(classId),
    enabled: Boolean(classId),
  });
}

export function useTeacherJournals() {
  return useQuery({
    queryKey: ['guru', 'journals'],
    queryFn: () => guruApi.getJournals(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherGradeComponents(classId: string, subjectId: string) {
  return useQuery({
    queryKey: ['guru', 'grade-components', classId, subjectId],
    queryFn: () => guruApi.getGradeComponents(classId, subjectId),
    enabled: Boolean(classId && subjectId),
  });
}

export function useTeacherStudentGrades(classId: string, subjectId: string) {
  return useQuery({
    queryKey: ['guru', 'grades', classId, subjectId],
    queryFn: () => guruApi.getStudentGrades(classId, subjectId),
    enabled: Boolean(classId && subjectId),
  });
}

export function useTeacherMaterials() {
  return useQuery({
    queryKey: ['guru', 'materials'],
    queryFn: () => guruApi.getMaterials(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherAssignments() {
  return useQuery({
    queryKey: ['guru', 'assignments'],
    queryFn: () => guruApi.getAssignments(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAssignmentSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ['guru', 'assignment-submissions', assignmentId],
    queryFn: () => guruApi.getAssignmentSubmissions(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

export function useTeacherExams() {
  return useQuery({
    queryKey: ['guru', 'exams'],
    queryFn: () => guruApi.getTeacherExams(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherLeaveRequests() {
  return useQuery({
    queryKey: ['guru', 'leave-requests'],
    queryFn: () => guruApi.getLeaveRequests(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherSalarySlips() {
  return useQuery({
    queryKey: ['guru', 'salary-slips'],
    queryFn: () => guruApi.getSalarySlips(),
    staleTime: 1000 * 60 * 15,
  });
}

export function useTeacherSelfAttendance() {
  return useQuery({
    queryKey: ['guru', 'self-attendance'],
    queryFn: () => guruApi.getSelfAttendance(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeacherHomeroomData(isHomeroom: boolean) {
  return useQuery({
    queryKey: ['guru', 'homeroom'],
    queryFn: () => guruApi.getHomeroomData(),
    enabled: isHomeroom,
    staleTime: 1000 * 60 * 5,
  });
}
