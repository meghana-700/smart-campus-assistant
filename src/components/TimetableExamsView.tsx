import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ClipboardList, Timer, ArrowRight, Layers, X, BookOpen, User } from 'lucide-react';
import { TimetableEntry, Exam, Student } from '../types';

interface TimetableExamsViewProps {
  user: Student;
  token: string;
}

export default function TimetableExamsView({ user, token }: TimetableExamsViewProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'timetable' | 'exams'>('timetable');
  const [selectedClass, setSelectedClass] = useState<TimetableEntry | null>(null);

  const days: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    async function loadData() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [ttRes, exRes] = await Promise.all([
          fetch('/api/timetable', { headers }),
          fetch('/api/exams', { headers })
        ]);

        if (ttRes.ok) setTimetable(await ttRes.json());
        if (exRes.ok) setExams(await exRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest">Loading Academic Timetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-800/60">
        <div>
          <h2 className="text-2xl font-bold text-white">Academic Calendars & Timetables</h2>
          <p className="text-sm text-slate-400 mt-1">Review lecture slots, lab layouts, and exam hall seating.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setSubTab('timetable')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              subTab === 'timetable' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Class Timetable</span>
          </button>
          
          <button
            onClick={() => setSubTab('exams')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              subTab === 'exams' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Official Examination Dates</span>
          </button>
        </div>
      </div>

      {subTab === 'timetable' ? (
        /* Full Week Timetable View */
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-white mb-2">Weekly Class Timetable Schedule</h3>
            <p className="text-xs text-slate-400 mb-6">Lectures and Laboratory slots sorted sequentially by day.</p>

            <div className="space-y-6">
              {days.map((day) => {
                const dayLectures = timetable.filter(t => t.day === day);
                return (
                  <div key={day} className="border-b border-slate-800/50 last:border-0 pb-6 last:pb-0">
                    <h4 className="font-bold text-blue-400 text-sm font-mono tracking-widest uppercase mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {day}
                    </h4>

                    {dayLectures.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayLectures.map((lecture) => (
                          <div 
                            key={lecture.id} 
                            onClick={() => setSelectedClass(lecture)}
                            className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 rounded-xl flex flex-col justify-between transition-all cursor-pointer group"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-bold text-slate-200 text-sm truncate group-hover:text-blue-400 transition-colors" title={lecture.subject}>
                                  {lecture.subject}
                                </h5>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                  {lecture.room}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{lecture.instructor}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>{lecture.time}</span>
                              </div>
                              <span className="text-[10px] text-blue-500/0 group-hover:text-blue-400 font-semibold transition-all">Details →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 text-xs italic">No scheduled lectures or labs for {day}.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Exam Date Sheet list */
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-white mb-2">End Semester Examination Schedule</h3>
            <p className="text-xs text-slate-400 mb-6">Official date sheet covering general exams and lab assessments.</p>

            {exams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                      <th className="py-4 px-4 font-semibold">Subject Title</th>
                      <th className="py-4 px-4 font-semibold">Date of Exam</th>
                      <th className="py-4 px-4 font-semibold">Time duration</th>
                      <th className="py-4 px-4 font-semibold">Class Hall Seating</th>
                      <th className="py-4 px-4 font-semibold text-right">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-200">{exam.subject}</td>
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono text-xs">{exam.time}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 border border-slate-850 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{exam.room}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-blue-400">{exam.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-4">No examination dates scheduled</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Class Specifications Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setSelectedClass(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedClass.day} Session
                </span>
                <h3 className="font-bold text-lg text-white mt-1.5 leading-snug">{selectedClass.subject}</h3>
              </div>
            </div>

            <div className="space-y-5 mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Classroom Hall</p>
                  <p className="text-sm font-bold text-slate-200 mt-1 flex items-center">
                    <MapPin className="w-4 h-4 text-blue-500 mr-1.5 shrink-0" />
                    <span>{selectedClass.room}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Lecturer / Instructor</p>
                  <p className="text-sm font-bold text-slate-200 mt-1 flex items-center">
                    <User className="w-4 h-4 text-blue-500 mr-1.5 shrink-0" />
                    <span className="truncate">{selectedClass.instructor.replace('Dr. ', '').replace('Mrs. ', '').replace('Prof. ', '')}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 uppercase tracking-wider">Time Window:</span>
                <span className="text-blue-400 font-bold flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 shrink-0" />
                  <span>{selectedClass.time}</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Topics & Concepts Covered</h4>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850/60 text-xs text-slate-300 leading-relaxed space-y-1">
                  {selectedClass.subject.includes('Artificial Intelligence') ? (
                    <>
                      <p>• Heuristic Search (A* & Minimax Algorithm)</p>
                      <p>• Knowledge Representation & Semantic Networks</p>
                      <p>• Neural Networks & Supervised ML Classifiers</p>
                    </>
                  ) : selectedClass.subject.includes('Software Engineering') ? (
                    <>
                      <p>• Agile Scrum methodology, Sprints, & Backlogs</p>
                      <p>• Unified Modeling Language (UML) class layouts</p>
                      <p>• SOLID design guidelines & modular codebases</p>
                    </>
                  ) : selectedClass.subject.includes('Compiler Design') ? (
                    <>
                      <p>• Lexical analyzer routines using Lex & Flex tools</p>
                      <p>• Parsing algorithms (LL(1), SLR, and LALR schemes)</p>
                      <p>• Abstract syntax trees & intermediate C code generation</p>
                    </>
                  ) : selectedClass.subject.includes('Computer Networks') ? (
                    <>
                      <p>• TCP/IP and OSI layer transport parameters</p>
                      <p>• CIDR Subnet allocation & routing protocols</p>
                      <p>• Wireshark packet tracer exercises</p>
                    </>
                  ) : selectedClass.subject.includes('Cloud Computing') ? (
                    <>
                      <p>• Virtual machine provisioning & Hypervisors</p>
                      <p>• Serverless functions and Docker container workloads</p>
                      <p>• AWS & Google Cloud microservices infrastructure</p>
                    </>
                  ) : (
                    <>
                      <p>• Core curriculum syllabus reference guidelines</p>
                      <p>• Technical documentation review & active discussions</p>
                      <p>• Case studies, quizzes, and laboratory exercises</p>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] text-blue-400 leading-normal">
                💡 <strong>Academic Prep Tip:</strong> Bring your fully charged laptops, lab manual prints, and note-pads. Attendance is registered at the start of the session!
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setSelectedClass(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
