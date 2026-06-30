import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getDb, saveDb, hashPassword, connectMongo, getMongoStatus } from './src/server/db';
import { Student, Notice, CampusEvent, PlacementUpdate, StudyMaterial } from './src/types';

// Initialize Express App
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Database / MongoDB Status Endpoint
app.get('/api/db-status', (req, res) => {
  res.json(getMongoStatus());
});

// Cryptographic token session secret
const SECRET_KEY = process.env.GEMINI_API_KEY || "smart-campus-super-secret-key-2026";

function generateToken(userId: string, role: string): string {
  const payload = `${userId}:${role}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return `${payload}:${signature}`;
}

function verifyToken(token: string | undefined): { userId: string; role: string } | null {
  if (!token) return null;
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  const [userId, role, signature] = parts;
  const payload = `${userId}:${role}`;
  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  if (signature === expectedSignature) {
    return { userId, role };
  }
  return null;
}

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. Token is missing.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
  req.user = decoded;
  next();
}

// Admin-only Access Middleware
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Admin role required.' });
  }
  next();
}

// Lazy load Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/* ================= AUTHENTICATION ENDPOINTS ================= */

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, enrollmentNo, department, semester, signupCode } = req.body;

  if (!name || !email || !password || !enrollmentNo || !department || !semester) {
    return res.status(400).json({ error: 'Please provide all required registration fields.' });
  }

  const db = getDb();
  const existsIdx = db.students.findIndex(s => s.email.toLowerCase() === email.toLowerCase());

  // Determine role based on administrator secret signup code
  const role = signupCode === 'CAMPUSADMIN2026' ? 'admin' : 'student';

  if (existsIdx !== -1) {
    // Gracefully update password, department, etc. so they can log in / reset password seamlessly
    db.students[existsIdx].name = name;
    db.students[existsIdx].passwordHash = hashPassword(password);
    db.students[existsIdx].enrollmentNo = enrollmentNo;
    db.students[existsIdx].department = department;
    if (role !== 'admin') {
      db.students[existsIdx].semester = semester;
    }
    db.students[existsIdx].role = role;
    saveDb(db);

    const token = generateToken(db.students[existsIdx].id, db.students[existsIdx].role);
    const { passwordHash, ...userProfile } = db.students[existsIdx];
    return res.status(200).json({ token, user: userProfile, message: 'Account updated and logged in successfully!' });
  }

  const newStudent: Student & { passwordHash: string } = {
    id: `student-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    enrollmentNo,
    department,
    semester: role === 'admin' ? 'N/A' : semester,
    role,
    attendance: role === 'admin' ? {} : {
      'Artificial Intelligence': { total: 0, present: 0 },
      'Software Engineering': { total: 0, present: 0 },
      'Computer Networks': { total: 0, present: 0 },
      'Compiler Design': { total: 0, present: 0 },
      'Cloud Computing': { total: 0, present: 0 }
    },
    joinedAt: new Date().toISOString()
  };

  db.students.push(newStudent);
  saveDb(db);

  const token = generateToken(newStudent.id, newStudent.role);

  // Return user details without password hash
  const { passwordHash, ...userProfile } = newStudent;
  res.status(201).json({ token, user: userProfile });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill in both email and password fields.' });
  }

  const db = getDb();
  const user = db.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  const token = generateToken(user.id, user.role);
  const { passwordHash, ...userProfile } = user;
  res.json({ token, user: userProfile });
});

app.get('/api/profile', authenticate, (req: any, res) => {
  const db = getDb();
  const user = db.students.find(s => s.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  const { passwordHash, ...userProfile } = user;
  res.json(userProfile);
});

app.get('/api/campus/directory', authenticate, (req, res) => {
  const db = getDb();
  const directory = db.students.map(s => {
    const { passwordHash, ...safeProfile } = s;
    return safeProfile;
  });
  res.json(directory);
});

app.put('/api/profile', authenticate, (req: any, res) => {
  const { enrollmentNo, department, semester } = req.body;
  const db = getDb();
  const idx = db.students.findIndex(s => s.id === req.user.userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Student account not found.' });
  }

  if (enrollmentNo) db.students[idx].enrollmentNo = enrollmentNo;
  if (department) db.students[idx].department = department;
  if (semester) db.students[idx].semester = semester;

  saveDb(db);
  const { passwordHash, ...userProfile } = db.students[idx];
  res.json(userProfile);
});


/* ================= STATS & INFRASTRUCTURE ENDPOINTS ================= */

app.get('/api/dashboard/stats', authenticate, (req: any, res) => {
  const db = getDb();
  const user = db.students.find(s => s.id === req.user.userId);
  
  // Calculate average attendance
  let avgAttendance = 0;
  if (user && Object.keys(user.attendance).length > 0) {
    const subjects = Object.values(user.attendance);
    const sum = subjects.reduce((acc, sub) => {
      if (sub.total === 0) return acc + 100; // default 100% if no sessions yet
      return acc + (sub.present / sub.total) * 100;
    }, 0);
    avgAttendance = Math.round(sum / subjects.length);
  }

  const upcomingExamsCount = db.exams.length;
  const activePlacementsCount = db.placements.filter(p => p.status === 'active').length;
  const noticesCount = db.notices.length;

  res.json({
    averageAttendance: avgAttendance || 85, // fallback
    upcomingExamsCount,
    activePlacementsCount,
    unreadNoticesCount: noticesCount
  });
});


/* ================= TIMETABLE & EXAMS ENDPOINTS ================= */

app.get('/api/timetable', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.timetable);
});

app.get('/api/exams', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.exams);
});


/* ================= NOTICE BOARD ENDPOINTS ================= */

app.get('/api/notices', authenticate, (req, res) => {
  const db = getDb();
  // Return sorted so important notices appear first, then newest notices
  const sorted = [...db.notices].sort((a, b) => {
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  res.json(sorted);
});

app.post('/api/notices', authenticate, requireAdmin, (req: any, res) => {
  const { title, content, category, important } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required.' });
  }

  const db = getDb();
  const adminUser = db.students.find(s => s.id === req.user.userId);
  const newNotice: Notice = {
    id: `notice-${Date.now()}`,
    title,
    content,
    category,
    date: new Date().toISOString(),
    author: adminUser ? adminUser.name : 'Administrator',
    important: !!important
  };

  db.notices.push(newNotice);
  saveDb(db);
  res.status(201).json(newNotice);
});

app.delete('/api/notices/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const initialLen = db.notices.length;
  db.notices = db.notices.filter(n => n.id !== req.params.id);
  
  if (db.notices.length === initialLen) {
    return res.status(404).json({ error: 'Notice not found.' });
  }

  saveDb(db);
  res.json({ success: true, message: 'Notice deleted successfully.' });
});


/* ================= CAMPUS EVENTS ENDPOINTS ================= */

app.get('/api/events', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.events);
});

app.post('/api/events', authenticate, requireAdmin, (req: any, res) => {
  const { title, description, date, time, venue } = req.body;
  if (!title || !description || !date || !time || !venue) {
    return res.status(400).json({ error: 'All fields (title, description, date, time, venue) are required.' });
  }

  const db = getDb();
  const adminUser = db.students.find(s => s.id === req.user.userId);
  const newEvent: CampusEvent = {
    id: `event-${Date.now()}`,
    title,
    description,
    date,
    time,
    venue,
    organizer: adminUser ? adminUser.name : 'University Event Cell',
    rsvpCount: 0,
    rsvps: []
  };

  db.events.push(newEvent);
  saveDb(db);
  res.status(201).json(newEvent);
});

app.post('/api/events/:id/rsvp', authenticate, (req: any, res) => {
  const db = getDb();
  const ev = db.events.find(e => e.id === req.params.id);
  if (!ev) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const studentId = req.user.userId;
  const index = ev.rsvps.indexOf(studentId);

  if (index > -1) {
    // Cancel RSVP
    ev.rsvps.splice(index, 1);
    ev.rsvpCount = Math.max(0, ev.rsvpCount - 1);
  } else {
    // Add RSVP
    ev.rsvps.push(studentId);
    ev.rsvpCount += 1;
  }

  saveDb(db);
  res.json(ev);
});

app.delete('/api/events/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const initialLen = db.events.length;
  db.events = db.events.filter(e => e.id !== req.params.id);

  if (db.events.length === initialLen) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  saveDb(db);
  res.json({ success: true, message: 'Event deleted successfully.' });
});


/* ================= PLACEMENTS & INTERNSHIPS ENDPOINTS ================= */

app.get('/api/placements', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.placements);
});

app.post('/api/placements', authenticate, requireAdmin, (req, res) => {
  const { company, role, type, eligibility, salaryPackage, deadline, description } = req.body;
  if (!company || !role || !type || !eligibility || !salaryPackage || !deadline || !description) {
    return res.status(400).json({ error: 'All placement details are required.' });
  }

  const db = getDb();
  const newPlacement: PlacementUpdate = {
    id: `placement-${Date.now()}`,
    company,
    role,
    type,
    eligibility,
    salaryPackage,
    deadline,
    description,
    status: 'active',
    appliedStudents: []
  };

  db.placements.push(newPlacement);
  saveDb(db);
  res.status(201).json(newPlacement);
});

app.post('/api/placements/:id/apply', authenticate, (req: any, res) => {
  const db = getDb();
  const pl = db.placements.find(p => p.id === req.params.id);
  if (!pl) {
    return res.status(404).json({ error: 'Placement profile not found.' });
  }

  if (pl.status !== 'active') {
    return res.status(400).json({ error: 'This placement application is closed.' });
  }

  const studentId = req.user.userId;
  if (!pl.appliedStudents.includes(studentId)) {
    pl.appliedStudents.push(studentId);
  }

  saveDb(db);
  res.json(pl);
});

app.delete('/api/placements/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const initialLen = db.placements.length;
  db.placements = db.placements.filter(p => p.id !== req.params.id);

  if (db.placements.length === initialLen) {
    return res.status(404).json({ error: 'Placement drive entry not found.' });
  }

  saveDb(db);
  res.json({ success: true, message: 'Placement drive entry deleted.' });
});


/* ================= STUDY MATERIALS ENDPOINTS ================= */

app.get('/api/materials', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.materials);
});

app.post('/api/materials', authenticate, (req: any, res) => {
  const { title, subject, description, department, semester, fileType, fileSize, downloadUrl } = req.body;

  if (!title || !subject || !description || !department || !semester) {
    return res.status(400).json({ error: 'Study resource header fields are fully required.' });
  }

  const db = getDb();
  const uploader = db.students.find(s => s.id === req.user.userId);
  const newMaterial: StudyMaterial = {
    id: `material-${Date.now()}`,
    title,
    subject,
    description,
    department,
    semester,
    downloadUrl: downloadUrl || '#',
    uploadedBy: uploader ? uploader.name : 'Campus Peer',
    fileType: fileType || 'pdf',
    fileSize: fileSize || '1.2 MB',
    downloadsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.materials.push(newMaterial);
  saveDb(db);
  res.status(201).json(newMaterial);
});

app.post('/api/materials/:id/download', authenticate, (req, res) => {
  const db = getDb();
  const mat = db.materials.find(m => m.id === req.params.id);
  if (!mat) {
    return res.status(404).json({ error: 'Material resource not found.' });
  }

  mat.downloadsCount += 1;
  saveDb(db);
  res.json(mat);
});

app.delete('/api/materials/:id', authenticate, (req: any, res) => {
  const db = getDb();
  const idx = db.materials.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Study material not found.' });
  }

  const material = db.materials[idx];
  const user = db.students.find(s => s.id === req.user.userId);

  // Allow deletion if admin OR if the user who uploaded it is the requester
  if (user?.role === 'admin' || material.uploadedBy === user?.name) {
    db.materials.splice(idx, 1);
    saveDb(db);
    return res.json({ success: true, message: 'Study material deleted successfully.' });
  }

  res.status(403).json({ error: 'Forbidden. You do not have permission to delete this file.' });
});


/* ================= CHATBOT SMART GROUNDING ENDPOINT ================= */

app.post('/api/chatbot', authenticate, async (req: any, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Query message is required.' });
  }

  try {
    const ai = getGeminiClient();
    const db = getDb();
    const user = db.students.find(s => s.id === req.user.userId);

    // Dynamic ground context to supply to the system instruction
    const userContext = user 
      ? `Student Name: ${user.name}, Enrollment: ${user.enrollmentNo}, Dept: ${user.department}, Sem: ${user.semester}, Attendance State: ${JSON.stringify(user.attendance)}`
      : 'Unknown Student';

    const systemInstruction = `You are "Smart Campus Assistant", the official voice and academic coordinator of this university.
Ground your answers deeply in our current active database state:
- Current Notices on Campus: ${JSON.stringify(db.notices)}
- Daily Timetable Schedules: ${JSON.stringify(db.timetable)}
- Official Exam Timetable: ${JSON.stringify(db.exams)}
- Placements & Internship Drives: ${JSON.stringify(db.placements)}
- Campus Events and Workshops: ${JSON.stringify(db.events)}
- Peer Study Materials: ${JSON.stringify(db.materials.map(m => ({ title: m.title, subject: m.subject, size: m.fileSize, by: m.uploadedBy })))}

Current active session details:
- Current Student Context: ${userContext}
- Current Date/Year: 2026.

Rules:
1. Always be supportive, encouraging, professional, and precise.
2. If the user asks about their specific timetable, attendance, exams, or active placement drives (like Microsoft, Google, etc.), supply exact schedules, dates, rooms, and eligibility details from the database context.
3. Keep formatting gorgeous and highly readable using bold tags, lists, or markdown tables.
4. If asked about study materials, list what's available and who uploaded it.
5. If some information is not in the database, politely offer general guidance or state that they should contact the university department.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "I apologize, but I could not compute a response. Please try again.";
    res.json({ text });

  } catch (err: any) {
    console.error('Gemini chatbot error:', err);
    res.status(500).json({ 
      error: 'An error occurred while communicating with the Smart Campus AI engine.', 
      details: err.message 
    });
  }
});


/* ================= BACKEND SERVING / VITE INTEGRATION ================= */

async function startServer() {
  await connectMongo();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static assets from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Campus Assistant server active at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start full-stack server:", err);
});
