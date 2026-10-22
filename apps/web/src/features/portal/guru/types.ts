export interface TeacherClass {
  id: string;
  name: string;
  gradeLevel: number;
  studentCount: number;
}

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
}

export interface TeacherScheduleItem {
  id: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  roomName: string;
  isAttendanceRecorded: boolean;
}

export interface TeacherAttendanceStudent {
  studentId: string;
  studentName: string;
  nisn: string;
  nis?: string;
  status: 'present' | 'sick' | 'permission' | 'unexcused';
  notes?: string;
}

export interface TeacherAttendanceSessionPayload {
  scheduleId?: string;
  classId: string;
  subjectId: string;
  sessionDate: string;
  sessionTopic?: string;
  attendees: Array<{
    studentId: string;
    status: 'present' | 'sick' | 'permission' | 'unexcused';
    notes?: string;
  }>;
}

export interface TeacherJournalItem {
  id: string;
  scheduleId?: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: string;
  timeSlot: string;
  lessonTopic: string;
  competenceIndicator: string;
  studentAbsentees: string[];
  learningObstacles?: string;
  isLocked: boolean;
  createdAt: string;
}

export interface TeacherGradeComponent {
  id: string;
  name: string;
  code: string;
  weight: number;
  classId?: string;
  subjectId: string;
}

export interface TeacherStudentGrade {
  studentId: string;
  studentName: string;
  nisn: string;
  scores: Record<string, number>; // misal: { 'comp-uh1': 85, 'comp-tugas': 90, 'comp-pts': 88 }
  finalScore: number;
  letterGrade: string;
  isPassed: boolean;
}

export interface TeacherMaterialItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classIds: string[];
  classNames: string[];
  fileUrl?: string;
  externalLink?: string;
  description: string;
  createdAt: string;
  downloadsCount: number;
}

export interface TeacherAssignmentItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  dueDate: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  description: string;
  createdAt: string;
}

export interface TeacherAssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  submittedAt: string;
  fileUrl?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded' | 'late';
}

export interface TeacherExamItem {
  id: string;
  title: string;
  subjectName: string;
  classNames: string[];
  durationMinutes: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  isProctor: boolean;
  status: 'scheduled' | 'ongoing' | 'completed';
}

export interface TeacherLeaveRequest {
  id: string;
  leaveType: 'sick' | 'annual' | 'family' | 'duty';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  createdAt: string;
}

export interface TeacherSalarySlipItem {
  id: string;
  slipNumber: string;
  periodMonth: string; // "Oktober 2026"
  basicSalary: number;
  teachingAllowance: number;
  functionalAllowance: number;
  deduction: number;
  totalNetSalary: number;
  paymentDate: string;
  isPaid: boolean;
  downloadUrl?: string;
}

export interface TeacherSelfAttendance {
  todayDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'late' | 'not_checked_in';
  workHoursThisMonth: number;
  targetWorkHours: number;
  attendancePercentage: number;
}

export interface TeacherHomeroomData {
  classId: string;
  className: string;
  totalStudents: number;
  academicYear: string;
  semester: string;
  attendanceRecap: {
    averageRate: number;
    sickDays: number;
    leaveDays: number;
    unexcusedDays: number;
  };
  characterRecapCount: number;
  isReportCardLocked: boolean;
  students: Array<{
    id: string;
    name: string;
    nisn: string;
    nis: string;
    attendanceRate: number;
    averageScore: number;
    rank: number;
  }>;
}

export interface TeacherQuestionBankItem {
  id: string;
  name: string;
  subject_id: string;
  grade_level_id?: string;
  questions_count?: number;
  subject?: { id: string; name: string; code: string };
  gradeLevel?: { id: string; name: string };
  questions?: Array<{
    id: string;
    question_type: string;
    body: { text?: string; [key: string]: any };
    cognitive_level?: string;
    difficulty?: number;
    weight?: number;
    options?: any[];
  }>;
}
