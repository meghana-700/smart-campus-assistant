export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentNo: string;
  department: string;
  semester: string;
  role: 'student' | 'admin';
  attendance: {
    [subject: string]: {
      total: number;
      present: number;
    };
  };
  joinedAt: string;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subject: string;
  time: string;
  room: string;
  instructor: string;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  duration: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'placement' | 'event' | 'general';
  date: string;
  author: string;
  important: boolean;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  rsvpCount: number;
  rsvps: string[]; // student ids
}

export interface PlacementUpdate {
  id: string;
  company: string;
  role: string;
  type: 'job' | 'internship';
  eligibility: string;
  salaryPackage: string;
  deadline: string;
  description: string;
  status: 'active' | 'closed';
  appliedStudents: string[]; // student ids
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  description: string;
  department: string;
  semester: string;
  downloadUrl: string; // Base64 content or static indicator
  uploadedBy: string; // admin or student name
  fileType: 'pdf' | 'docx' | 'pptx' | 'zip';
  fileSize: string;
  downloadsCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface DashboardStats {
  averageAttendance: number;
  upcomingExamsCount: number;
  activePlacementsCount: number;
  unreadNoticesCount: number;
}
