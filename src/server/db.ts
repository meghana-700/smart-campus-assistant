import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { 
  Student, 
  TimetableEntry, 
  Exam, 
  Notice, 
  CampusEvent, 
  PlacementUpdate, 
  StudyMaterial 
} from '../types.js';

const DB_FILE = path.join(process.cwd(), 'db.json');

// SHA-256 Simple Hashing
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export interface DbSchema {
  students: (Student & { passwordHash: string })[];
  timetable: TimetableEntry[];
  exams: Exam[];
  notices: Notice[];
  events: CampusEvent[];
  placements: PlacementUpdate[];
  materials: StudyMaterial[];
}

const initialDb: DbSchema = {
  students: [
    {
      id: 'student-1',
      name: 'Meghana Bezawada',
      email: 'meghanabezawada161@gmail.com',
      passwordHash: hashPassword('password123'),
      enrollmentNo: 'CST-2026-089',
      department: 'Computer Science & Technology (CST)',
      semester: '6th Semester',
      role: 'student',
      attendance: {
        'Artificial Intelligence': { total: 40, present: 36 },
        'Software Engineering': { total: 35, present: 32 },
        'Computer Networks': { total: 38, present: 31 },
        'Compiler Design': { total: 42, present: 34 },
        'Cloud Computing': { total: 30, present: 29 }
      },
      joinedAt: new Date().toISOString()
    },
    {
      id: 'admin-1',
      name: 'Dr. Sarah Jenkins',
      email: 'admin@campus.edu',
      passwordHash: hashPassword('admin123'),
      enrollmentNo: 'ADMIN-101',
      department: 'Information Technology',
      semester: 'N/A',
      role: 'admin',
      attendance: {},
      joinedAt: new Date().toISOString()
    }
  ],
  timetable: [
    { id: 't1', day: 'Monday', subject: 'Artificial Intelligence', time: '09:00 AM - 10:30 AM', room: 'LH-301', instructor: 'Dr. R. K. Prasad' },
    { id: 't2', day: 'Monday', subject: 'Software Engineering', time: '11:00 AM - 12:30 PM', room: 'LH-302', instructor: 'Prof. Anil Kumar' },
    { id: 't3', day: 'Monday', subject: 'Compiler Design Lab', time: '02:00 PM - 04:00 PM', room: 'Lab-5', instructor: 'Dr. Sarah Jenkins' },
    
    { id: 't4', day: 'Tuesday', subject: 'Computer Networks', time: '09:00 AM - 10:30 AM', room: 'LH-301', instructor: 'Mrs. S. Roy' },
    { id: 't5', day: 'Tuesday', subject: 'Cloud Computing', time: '11:00 AM - 12:30 PM', room: 'LH-305', instructor: 'Prof. P. Bose' },
    
    { id: 't6', day: 'Wednesday', subject: 'Artificial Intelligence', time: '09:00 AM - 10:30 AM', room: 'LH-301', instructor: 'Dr. R. K. Prasad' },
    { id: 't7', day: 'Wednesday', subject: 'Compiler Design', time: '11:00 AM - 12:30 PM', room: 'LH-302', instructor: 'Dr. Sarah Jenkins' },
    { id: 't8', day: 'Wednesday', subject: 'Technical Seminar', time: '02:00 PM - 03:30 PM', room: 'Seminar Hall B', instructor: 'Prof. Anil Kumar' },
    
    { id: 't9', day: 'Thursday', subject: 'Computer Networks', time: '09:00 AM - 10:30 AM', room: 'LH-301', instructor: 'Mrs. S. Roy' },
    { id: 't10', day: 'Thursday', subject: 'Software Engineering', time: '11:00 AM - 12:30 PM', room: 'LH-302', instructor: 'Prof. Anil Kumar' },
    
    { id: 't11', day: 'Friday', subject: 'Cloud Computing', time: '09:00 AM - 10:30 AM', room: 'LH-305', instructor: 'Prof. P. Bose' },
    { id: 't12', day: 'Friday', subject: 'Compiler Design', time: '11:00 AM - 12:30 PM', room: 'LH-302', instructor: 'Dr. Sarah Jenkins' }
  ],
  exams: [
    { id: 'e1', subject: 'Artificial Intelligence', date: '2026-07-15', time: '10:00 AM - 01:00 PM', room: 'Examination Hall-A', duration: '3 Hours' },
    { id: 'e2', subject: 'Computer Networks', date: '2026-07-17', time: '10:00 AM - 01:00 PM', room: 'Examination Hall-A', duration: '3 Hours' },
    { id: 'e3', subject: 'Compiler Design', date: '2026-07-20', time: '10:00 AM - 01:00 PM', room: 'Examination Hall-B', duration: '3 Hours' },
    { id: 'e4', subject: 'Software Engineering', date: '2026-07-22', time: '10:00 AM - 01:00 PM', room: 'Examination Hall-A', duration: '3 Hours' },
    { id: 'e5', subject: 'Cloud Computing', date: '2026-07-25', time: '10:00 AM - 01:00 PM', room: 'Examination Hall-B', duration: '3 Hours' }
  ],
  notices: [
    {
      id: 'n1',
      title: 'End Semester Examinations Timetable Release',
      content: 'The timetable for the upcoming End Semester Examinations starting from July 15th, 2026 has been published. All students are advised to download the schedules and verify their room allocations. Hall tickets will be issued from July 5th onwards.',
      category: 'academic',
      date: '2026-06-28T10:00:00.000Z',
      author: 'Office of the Controller of Examinations',
      important: true
    },
    {
      id: 'n2',
      title: 'Google Placement Drive - CST & IT 2026 Batch',
      content: 'Google India is organizing a campus placement drive for final year CST and IT students. Eligible candidates must have a CGPA of 8.0 and above with no active backlogs. Deadline to submit the application form is July 5th, 2026.',
      category: 'placement',
      date: '2026-06-29T14:30:00.000Z',
      author: 'Training & Placement Officer',
      important: true
    },
    {
      id: 'n3',
      title: 'Annual Tech Fest "TechStorm 2026" - Call for Volunteers',
      content: 'Our annual national-level technical symposium "TechStorm 2026" will be held on October 12-14. Core committee nominations are open for events management, sponsorships, web development, and branding teams. Register on the portal.',
      category: 'event',
      date: '2026-06-27T11:15:00.000Z',
      author: 'Student Activity Council',
      important: false
    }
  ],
  events: [
    {
      id: 'ev1',
      title: 'Workshop on Advanced Deep Learning',
      description: 'Hands-on practical session covering Transformers, Generative Adversarial Networks (GANs), and Large Language Models using TensorFlow and PyTorch. Guest speaker Dr. Alok Nath from Google AI Research.',
      date: '2026-07-08',
      time: '10:00 AM - 04:00 PM',
      venue: 'Sanjay Gandhi Seminar Auditorium',
      organizer: 'Department of Computer Science',
      rsvpCount: 24,
      rsvps: ['student-1']
    },
    {
      id: 'ev2',
      title: 'Hackathon: CodeForGood 2026',
      description: 'A 24-hour coding challenge where teams brainstorm and build innovative solutions addressing real-world environmental sustainability challenges. Cash prizes up for grabs!',
      date: '2026-07-12',
      time: '09:00 AM onwards',
      venue: 'Campus Innovation Hub',
      organizer: 'IEEE Student Chapter',
      rsvpCount: 45,
      rsvps: []
    }
  ],
  placements: [
    {
      id: 'p1',
      company: 'Google',
      role: 'Associate Software Engineer',
      type: 'job',
      eligibility: 'B.Tech / M.Tech in CST / IT with CGPA >= 8.0',
      salaryPackage: '₹18,50,000 - ₹24,00,000 LPA',
      deadline: '2026-07-05',
      description: 'Join the Core Engineering team to design, develop, and deploy scalable platforms and next-generation browser capabilities. Requires strong foundations in Data Structures, Algorithms, and System Design.',
      status: 'active',
      appliedStudents: ['student-1']
    },
    {
      id: 'p2',
      company: 'Microsoft',
      role: 'Software Development Engineer Intern',
      type: 'internship',
      eligibility: 'Pre-final Year CST/ECE/IT students, CGPA >= 7.5',
      salaryPackage: '₹80,000 / month stipend',
      deadline: '2026-07-10',
      description: 'A 10-12 week immersive summer internship experience working on real production code inside Azure Core Networks or Microsoft 365 developer suites.',
      status: 'active',
      appliedStudents: []
    },
    {
      id: 'p3',
      company: 'TCS Digital',
      role: 'Systems Engineer',
      type: 'job',
      eligibility: 'Open to all Engineering disciplines with CGPA >= 7.0',
      salaryPackage: '₹7,00,000 LPA',
      deadline: '2026-07-20',
      description: 'Accelerate digital transformation journeys for enterprise banking and healthcare systems worldwide. Requires basic proficiency in Python, Java, or Node.js.',
      status: 'active',
      appliedStudents: []
    }
  ],
  materials: [
    {
      id: 'm1',
      title: 'Artificial Intelligence - Full Lecture Notes',
      subject: 'Artificial Intelligence',
      description: 'Complete comprehensive study notes covering Search Algorithms (A*, DFS, BFS), Knowledge Representation, Probabilistic Reasoning, and Introduction to Neural Networks.',
      department: 'Computer Science & Technology (CST)',
      semester: '6th Semester',
      downloadUrl: '#',
      uploadedBy: 'Dr. R. K. Prasad',
      fileType: 'pdf',
      fileSize: '4.2 MB',
      downloadsCount: 128,
      createdAt: '2026-06-20T08:00:00.000Z'
    },
    {
      id: 'm2',
      title: 'Compiler Design Lab Manual & Sample Programs',
      subject: 'Compiler Design',
      description: 'Detailed laboratory worksheets outlining Lex/Yacc program examples, LL(1) parsers, abstract syntax tree nodes, and basic intermediate code generators.',
      department: 'Computer Science & Technology (CST)',
      semester: '6th Semester',
      downloadUrl: '#',
      uploadedBy: 'Dr. Sarah Jenkins',
      fileType: 'zip',
      fileSize: '1.8 MB',
      downloadsCount: 95,
      createdAt: '2026-06-22T09:30:00.000Z'
    },
    {
      id: 'm3',
      title: 'Software Engineering Best Practices Guide',
      subject: 'Software Engineering',
      description: 'Curated quick references regarding Agile methodologies, Unified Modeling Language (UML) structural layouts, MVC design patterns, and clean architecture guides.',
      department: 'Computer Science & Technology (CST)',
      semester: '6th Semester',
      downloadUrl: '#',
      uploadedBy: 'Prof. Anil Kumar',
      fileType: 'pdf',
      fileSize: '2.5 MB',
      downloadsCount: 64,
      createdAt: '2026-06-25T14:15:00.000Z'
    }
  ]
};

// ================= MONGOOSE SCHEMAS & MODELS =================

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  enrollmentNo: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  role: { type: String, required: true },
  attendance: { type: mongoose.Schema.Types.Mixed, default: {} },
  joinedAt: { type: String, required: true }
}, { minimize: false });

const TimetableSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  day: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  instructor: { type: String, required: true }
});

const ExamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  duration: { type: String, required: true }
});

const NoticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  author: { type: String, required: true },
  important: { type: Boolean, default: false }
});

const EventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  organizer: { type: String, required: true },
  rsvpCount: { type: Number, default: 0 },
  rsvps: { type: [String], default: [] }
});

const PlacementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, required: true },
  eligibility: { type: String, required: true },
  salaryPackage: { type: String, required: true },
  deadline: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'active' },
  appliedStudents: { type: [String], default: [] }
});

const MaterialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  downloadUrl: { type: String, default: '#' },
  uploadedBy: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true },
  downloadsCount: { type: Number, default: 0 },
  createdAt: { type: String, required: true }
});

const StudentModel = (mongoose.models.Student || mongoose.model('Student', StudentSchema)) as any;
const TimetableModel = (mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema)) as any;
const ExamModel = (mongoose.models.Exam || mongoose.model('Exam', ExamSchema)) as any;
const NoticeModel = (mongoose.models.Notice || mongoose.model('Notice', NoticeSchema)) as any;
const EventModel = (mongoose.models.Event || mongoose.model('Event', EventSchema)) as any;
const PlacementModel = (mongoose.models.Placement || mongoose.model('Placement', PlacementSchema)) as any;
const MaterialModel = (mongoose.models.Material || mongoose.model('Material', MaterialSchema)) as any;

// ================= ACTIVE MEMORY DB & HOT-SYNC ENGINE =================

let activeMemoryDb: DbSchema = { ...initialDb };
let isConnected = false;
let isLoaded = false;
let mongoError: string | null = null;

// Expose MongoDB Connection Status for the front-end dashboard
export function getMongoStatus() {
  return {
    isConnected,
    error: mongoError,
    usingFallback: !isConnected
  };
}

// Connect to MongoDB Atlas
export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ MONGODB_URI is not set. Running in offline/file backup mode.");
    isLoaded = true;
    loadLocalDbBackup();
    return;
  }
  try {
    console.log("⚡ Connecting to MongoDB Atlas Cluster...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds fail-fast timeout for IP Whitelisting issues
    });
    isConnected = true;
    mongoError = null;
    console.log("🌐 MongoDB Atlas connected successfully!");

    // Seed or Load database state from MongoDB Atlas
    await loadDbFromMongo();
  } catch (err: any) {
    mongoError = err.message || String(err);
    console.error("❌ Failed to connect to MongoDB Atlas:", err);
    console.log("🔄 Seamless Fallback: Initializing local JSON fallback system.");
    isConnected = false;
    isLoaded = true;
    loadLocalDbBackup();
  }
}

// Helper to load or create local database backup file
function loadLocalDbBackup() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      activeMemoryDb = JSON.parse(data);
      console.log("📖 Fallback: Successfully loaded dataset from local JSON database.");
    } catch (e) {
      console.error("❌ Fallback error parsing local JSON backup, seeding from initialDb:", e);
      activeMemoryDb = { ...initialDb };
    }
  } else {
    console.log("🌱 Fallback: Local JSON database file not found. Creating and seeding initial academic dataset.");
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      activeMemoryDb = { ...initialDb };
    } catch (e) {
      console.error("❌ Fallback error writing local database file:", e);
    }
  }
}

// Load datasets from MongoDB
async function loadDbFromMongo() {
  try {
    const students = await StudentModel.find().lean();
    const timetable = await TimetableModel.find().lean();
    const exams = await ExamModel.find().lean();
    const notices = await NoticeModel.find().lean();
    const events = await EventModel.find().lean();
    const placements = await PlacementModel.find().lean();
    const materials = await MaterialModel.find().lean();

    // If MongoDB Atlas is brand new/empty, seed the initial databases
    if (students.length === 0) {
      console.log("🌱 MongoDB Atlas collections are empty. Seeding initial academic datasets...");
      await StudentModel.insertMany(initialDb.students);
      await TimetableModel.insertMany(initialDb.timetable);
      await ExamModel.insertMany(initialDb.exams);
      await NoticeModel.insertMany(initialDb.notices);
      await EventModel.insertMany(initialDb.events);
      await PlacementModel.insertMany(initialDb.placements);
      await MaterialModel.insertMany(initialDb.materials);

      activeMemoryDb = { ...initialDb };
      console.log("✅ MongoDB seeded successfully!");
    } else {
      // Map MongoDB records to the exact DbSchema types
      activeMemoryDb = {
        students: students.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          passwordHash: s.passwordHash,
          enrollmentNo: s.enrollmentNo,
          department: s.department,
          semester: s.semester,
          role: s.role,
          attendance: s.attendance || {},
          joinedAt: s.joinedAt
        })),
        timetable: timetable.map((t: any) => ({
          id: t.id,
          day: t.day,
          subject: t.subject,
          time: t.time,
          room: t.room,
          instructor: t.instructor
        })),
        exams: exams.map((e: any) => ({
          id: e.id,
          subject: e.subject,
          date: e.date,
          time: e.time,
          room: e.room,
          duration: e.duration
        })),
        notices: notices.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          category: n.category,
          date: n.date,
          author: n.author,
          important: n.important
        })),
        events: events.map((ev: any) => ({
          id: ev.id,
          title: ev.title,
          description: ev.description,
          date: ev.date,
          time: ev.time,
          venue: ev.venue,
          organizer: ev.organizer,
          rsvpCount: ev.rsvpCount,
          rsvps: ev.rsvps || []
        })),
        placements: placements.map((p: any) => ({
          id: p.id,
          company: p.company,
          role: p.role,
          type: p.type,
          eligibility: p.eligibility,
          salaryPackage: p.salaryPackage,
          deadline: p.deadline,
          description: p.description,
          status: p.status,
          appliedStudents: p.appliedStudents || []
        })),
        materials: materials.map((m: any) => ({
          id: m.id,
          title: m.title,
          subject: m.subject,
          description: m.description,
          department: m.department,
          semester: m.semester,
          downloadUrl: m.downloadUrl,
          uploadedBy: m.uploadedBy,
          fileType: m.fileType,
          fileSize: m.fileSize,
          downloadsCount: m.downloadsCount,
          createdAt: m.createdAt
        }))
      };
      console.log("📖 Successfully synchronized database cache from MongoDB Atlas!");
    }
    isLoaded = true;

    // Save backup copy locally
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(activeMemoryDb, null, 2), 'utf-8');
    } catch (_) {}
  } catch (err) {
    console.error("❌ Error retrieving datasets from MongoDB:", err);
  }
}

// Persist memory cache updates back to MongoDB Atlas
async function saveDbToMongo(db: DbSchema) {
  if (!isConnected) return;
  try {
    // 1. Sync Students (Use findOneAndUpdate to prevent overwriting/race conditions)
    for (const student of db.students) {
      await StudentModel.findOneAndUpdate(
        { id: student.id },
        {
          id: student.id,
          name: student.name,
          email: student.email,
          passwordHash: student.passwordHash,
          enrollmentNo: student.enrollmentNo,
          department: student.department,
          semester: student.semester,
          role: student.role,
          attendance: student.attendance,
          joinedAt: student.joinedAt
        },
        { upsert: true, new: true }
      );
    }
    // Prune deleted students
    const studentIds = db.students.map(s => s.id);
    await StudentModel.deleteMany({ id: { $nin: studentIds } });

    // 2. Sync Timetable
    await TimetableModel.deleteMany({});
    if (db.timetable.length > 0) {
      await TimetableModel.insertMany(db.timetable);
    }

    // 3. Sync Exams
    await ExamModel.deleteMany({});
    if (db.exams.length > 0) {
      await ExamModel.insertMany(db.exams);
    }

    // 4. Sync Notices
    await NoticeModel.deleteMany({});
    if (db.notices.length > 0) {
      await NoticeModel.insertMany(db.notices);
    }

    // 5. Sync Events
    await EventModel.deleteMany({});
    if (db.events.length > 0) {
      await EventModel.insertMany(db.events);
    }

    // 6. Sync Placements
    await PlacementModel.deleteMany({});
    if (db.placements.length > 0) {
      await PlacementModel.insertMany(db.placements);
    }

    // 7. Sync Materials
    await MaterialModel.deleteMany({});
    if (db.materials.length > 0) {
      await MaterialModel.insertMany(db.materials);
    }

    console.log("💾 Synchronized in-memory dataset states perfectly back to MongoDB Atlas!");
  } catch (err) {
    console.error("❌ Error syncing state changes back to MongoDB:", err);
  }
}

// Core Database Interfaces used by the server endpoints
export function getDb(): DbSchema {
  try {
    if (!isLoaded && fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      activeMemoryDb = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local fallback JSON database', err);
  }
  return activeMemoryDb;
}

export function saveDb(db: DbSchema): void {
  activeMemoryDb = db;
  
  // Save local fallback JSON copy
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local JSON db backup file', err);
  }

  // Sync to MongoDB asynchronously without blocking client response Thread
  saveDbToMongo(db).catch(err => {
    console.error('Failed to async-push state updates to MongoDB:', err);
  });
}
