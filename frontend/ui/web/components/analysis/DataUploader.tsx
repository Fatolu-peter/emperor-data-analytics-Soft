import React, { ChangeEvent } from "react";

interface DataUploaderProps {
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  file: File | null;
  loading: boolean;
  session: {
    exists: boolean;
    filename?: string;
    shape?: [number, number];
  };
}

export function DataUploader({ onFileSelect, onUpload, file, loading, session }: DataUploaderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <section className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-sm backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-white/90">1. Load Data</h2>
        {session.exists && (
          <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            Active: <strong>{session.filename || "Uploaded File"}</strong>
            {session.shape && <span className="text-green-400/70">({session.shape[0]} rows, {session.shape[1]} cols)</span>}
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center bg-black/20 p-4 rounded-lg border border-white/5">
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600/20 file:text-blue-400
            hover:file:bg-blue-600/30 file:transition-colors file:cursor-pointer"
        />
        <button
          onClick={onUpload}
          disabled={!file || loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Upload"}
        </button>
      </div>
    </section>
  );
}
