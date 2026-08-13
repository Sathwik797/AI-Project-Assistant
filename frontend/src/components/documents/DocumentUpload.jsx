import React, { useRef, useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

export default function DocumentUpload({ onUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const validateAndUpload = (file) => {
    setUploadError('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setUploadError('Unsupported file type. Only PDF, DOCX, and TXT files are accepted.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds maximum limit of 15 MB.');
      return;
    }
    onUpload(file);
  };

  return (
    <div className="space-y-2 select-none">
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) validateAndUpload(file);
        }}
        className={`bg-white dark:bg-slate-900 border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="hidden"
          disabled={isUploading}
        />

        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-2 shadow-2xs">
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        </div>

        <h4 className="text-xs font-bold text-slate-800 dark:text-white">
          {isUploading ? 'Uploading & Extracting Document...' : 'Upload Project Document'}
        </h4>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Supports <strong>PDF</strong>, <strong>DOCX</strong>, and <strong>TXT</strong> files up to 15 MB.
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-3 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-colors disabled:opacity-50"
        >
          Browse Files
        </button>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
