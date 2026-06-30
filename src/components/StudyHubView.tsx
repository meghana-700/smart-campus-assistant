import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Download, UploadCloud, FileText, CheckCircle2, Trash2, Calendar, FileType, PlusCircle } from 'lucide-react';
import { StudyMaterial, Student } from '../types';

interface StudyHubViewProps {
  user: Student;
  token: string;
}

export default function StudyHubView({ user, token }: StudyHubViewProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Custom drag and drop upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New study material state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState(user.department || 'Computer Science & Technology (CST)');
  const [newSem, setNewSem] = useState(user.semester || '6th Semester');
  const [newType, setNewType] = useState<'pdf' | 'docx' | 'pptx' | 'zip'>('pdf');

  useEffect(() => {
    async function loadMaterials() {
      try {
        const res = await fetch('/api/materials', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setMaterials(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMaterials();
  }, [token]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop or selection
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  // Simulate file upload with network feedback
  const processUpload = (file: File) => {
    if (!newTitle || !newSubject) {
      alert("Please provide a Title and Subject first!");
      return;
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          completeUpload(file);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const completeUpload = async (file: File) => {
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const extension = file.name.split('.').pop()?.toLowerCase() as any;
    const validExtensions = ['pdf', 'docx', 'pptx', 'zip'];
    const chosenType = validExtensions.includes(extension) ? extension : 'pdf';

    const payload = {
      title: newTitle,
      subject: newSubject,
      description: newDesc || `Course study notes uploaded for academic reference.`,
      department: newDept,
      semester: newSem,
      fileType: chosenType,
      fileSize: sizeStr,
      downloadUrl: '#' // Base64 simulation
    };

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const uploadedMat = await res.json();
        setMaterials(prev => [uploadedMat, ...prev]);
        setUploadSuccess(`Successfully uploaded study file "${file.name}"!`);
        
        // Reset form
        setNewTitle('');
        setNewSubject('');
        setNewDesc('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setUploadProgress(null);
        setUploadSuccess(null);
      }, 4000);
    }
  };

  // Handle Download trigger
  const handleDownload = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/materials/${id}/download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setMaterials(prev => prev.map(m => m.id === id ? updated : m));
        alert(`Your digital academic resource "${title}" download is starting.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Resource Deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study resource?")) return;

    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMaterials(prev => prev.filter(m => m.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete this resource.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMaterials = materials.filter(m => {
    return m.title.toLowerCase().includes(search.toLowerCase()) ||
           m.subject.toLowerCase().includes(search.toLowerCase()) ||
           m.department.toLowerCase().includes(search.toLowerCase()) ||
           m.semester.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-mono mt-3 uppercase tracking-widest">Entering Study Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-800/60">
        <h2 className="text-2xl font-bold text-white">Digital Study Materials Hub</h2>
        <p className="text-sm text-slate-400 mt-1">Access syllabus outlines, notes, laboratory manuals and previous year questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Column (Left Span 1) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-5">
          <div>
            <h3 className="font-bold text-base text-white">Upload New Reference Note</h3>
            <p className="text-xs text-slate-400 mt-1">Contribute lecture notes or sample worksheets to the peer network.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Material Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Compiler Design Unit 1 Notes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subject Stream</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g., Compiler Design"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Brief description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe key topics inside this PDF/resource..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Interactive Drag and Drop Container */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/5' 
                : 'border-slate-800 bg-slate-950 hover:bg-slate-950/80 hover:border-slate-700'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".pdf,.docx,.pptx,.zip"
            />
            
            <UploadCloud className="w-8 h-8 text-blue-500 mx-auto animate-bounce-slow" />
            <p className="text-xs text-slate-300 font-semibold mt-3">Drag files here, or click to explore</p>
            <p className="text-[10px] text-slate-500 mt-1">Accepts PDF, DOCX, PPTX, or ZIP (Max 10MB)</p>
          </div>

          {/* Progress state */}
          {uploadProgress !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Uploading stream...</span>
                <span className="text-blue-400 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-800">
                <div className="bg-blue-600 h-1 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Resources Feed (Right Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference books, syllabus notes, code templates..."
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((mat) => (
                <div key={mat.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-blue-400 shrink-0 uppercase font-mono font-bold text-xs flex flex-col items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-[9px] text-slate-500 mt-1">{mat.fileType}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{mat.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{mat.subject} | {mat.semester}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">{mat.description}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-500 font-mono">
                        <span>Size: {mat.fileSize}</span>
                        <span>Uploader: <strong className="text-slate-400">{mat.uploadedBy}</strong></span>
                        <span className="flex items-center space-x-1">
                          <Download className="w-3.5 h-3.5" />
                          <span>{mat.downloadsCount} downloads</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3.5 self-end sm:self-center">
                    {(user.role === 'admin' || mat.uploadedBy === user.name) && (
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-2 bg-slate-950 hover:bg-rose-500/15 border border-slate-850 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(mat.id, mat.title)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/10"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-4">No matching books or papers posted.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
