import { useState, useEffect } from "react";
import { pythonApi, type UploadResponse, type StatsResponse, type CleanResponse, type RegressionResponse, type AnovaResponse } from "../../core/api/python";
import { Link } from "@dex/router/client";

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [session, setSession] = useState<{
    exists: boolean;
    filename?: string;
    shape?: [number, number];
  }>({ exists: false });
  
  // Column Selectors
  const [columns, setColumns] = useState<string[]>([]);
  const [regTarget, setRegTarget] = useState("");
  const [anovaGroup, setAnovaGroup] = useState("");
  const [anovaValue, setAnovaValue] = useState("");

  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [cleanResult, setCleanResult] = useState<CleanResponse | null>(null);
  const [regResult, setRegResult] = useState<RegressionResponse | null>(null);
  const [anovaResult, setAnovaResult] = useState<AnovaResponse | null>(null);

  // Check existing session on mount
  useEffect(() => {
    pythonApi.checkSession().then(async (s) => {
        setSession(s);
        if(s.exists) {
            // Need columns?
            // In a real app we might fetch metadata separately
        }
    }).catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await pythonApi.upload(file);
      setUploadData(res);
      setColumns(res.columns);
      setSession({ exists: true, filename: file.name, shape: res.shape });
      
      // Reset
      setStats(null);
      setCleanResult(null);
      setRegResult(null);
      setAnovaResult(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await pythonApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClean = async () => {
    setLoading(true);
    try {
      const data = await pythonApi.cleanData();
      setCleanResult(data);
      setSession(prev => ({ ...prev, shape: [data.final_rows, prev.shape?.[1] || 0] }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegression = async () => {
      if(!regTarget) {
          setError("Please select a target column for regression");
          return;
      }
      setLoading(true);
      setError(null);
      try {
          const res = await pythonApi.runRegression(regTarget);
          setRegResult(res);
      } catch(err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleAnova = async () => {
      if(!anovaGroup || !anovaValue) {
          setError("Please select both Group and Value columns for ANOVA");
          return;
      }
      setLoading(true);
      setError(null);
      try {
          const res = await pythonApi.runAnova(anovaGroup, anovaValue);
          setAnovaResult(res);
      } catch(err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Emperor Analytics
          </h1>
          <p className="text-[var(--text-muted)] mt-2">
            Professional Data Analysis Dashboard
          </p>
        </div>
        <Link to="/" className="text-blue-400 hover:underline">
          Back format Home
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Concept */}
        <section className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. Load Data</h2>
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Processing..." : "Upload"}
            </button>
          </div>
          
          {session.exists && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded text-green-300 text-sm">
              ✅ Active Session: <strong>{session.filename || "Uploaded File"}</strong> 
              {session.shape && ` (${session.shape[0]} rows, ${session.shape[1]} cols)`}
            </div>
          )}
        </section>

        {session.exists && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Actions */}
            <section className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-xl h-full">
              <h2 className="text-xl font-semibold mb-4">2. Actions</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={fetchStats}
                  className="w-full text-left px-4 py-3 bg-[var(--border)] hover:bg-slate-700 rounded-lg transition-colors flex justify-between items-center"
                >
                  <span>📊 Get Descriptive Statistics</span>
                </button>
                <button
                  onClick={handleClean}
                  className="w-full text-left px-4 py-3 bg-[var(--border)] hover:bg-slate-700 rounded-lg transition-colors flex justify-between items-center"
                >
                  <span>🧹 Clean Data (Auto-Fix)</span>
                </button>
                
                {/* Regression UI */}
                <div className="bg-[var(--border)] p-4 rounded-lg space-y-2">
                    <p className="font-semibold text-sm">📈 Linear Regression</p>
                    <select 
                        className="w-full p-2 bg-[var(--bg)] border border-gray-700 rounded text-sm"
                        value={regTarget}
                        onChange={(e) => setRegTarget(e.target.value)}
                    >
                        <option value="">Select Target Variable</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={handleRegression}
                        className="w-full py-2 bg-blue-600/80 hover:bg-blue-600 text-sm rounded transition-colors"
                    >
                        Run Regression
                    </button>
                </div>

                {/* ANOVA UI */}
                <div className="bg-[var(--border)] p-4 rounded-lg space-y-2">
                    <p className="font-semibold text-sm">🧪 ANOVA</p>
                    <select 
                        className="w-full p-2 bg-[var(--bg)] border border-gray-700 rounded text-sm"
                        value={anovaGroup}
                        onChange={(e) => setAnovaGroup(e.target.value)}
                    >
                        <option value="">Select Group Column</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                        className="w-full p-2 bg-[var(--bg)] border border-gray-700 rounded text-sm"
                        value={anovaValue}
                        onChange={(e) => setAnovaValue(e.target.value)}
                    >
                        <option value="">Select Value Column</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={handleAnova}
                        className="w-full py-2 bg-purple-600/80 hover:bg-purple-600 text-sm rounded transition-colors"
                    >
                        Run ANOVA
                    </button>
                </div>
              </div>
            </section>

            {/* Results Display */}
            <section className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-xl overflow-auto h-full max-h-[600px]">
              <h2 className="text-xl font-semibold mb-4">3. Results</h2>
              
              {!stats && !cleanResult && !uploadData && !regResult && !anovaResult && (
                <p className="text-[var(--text-muted)] italic">Select an action to see results...</p>
              )}

              {/* Upload Preview */}
              {uploadData && !stats && !cleanResult && (
                 <div>
                    <h3 className="font-bold text-blue-400 mb-2">Data Preview:</h3>
                    <pre className="text-xs bg-black/50 p-4 rounded overflow-auto">
                      {JSON.stringify(uploadData.preview, null, 2)}
                    </pre>
                 </div>
              )}

              {/* Stats View */}
              {!regResult && !anovaResult && stats && (
                <div className="space-y-4 mb-8">
                  <h3 className="font-bold text-lg border-b border-gray-700 pb-2">Descriptive Statistics</h3>
                  <div>
                    <h4 className="font-semibold text-blue-400">Mean Values:</h4>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.entries(stats.mean).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm border-b border-gray-700 pb-1">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-mono">{typeof v === 'number' ? v.toFixed(2) : 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Result View */}
              {!regResult && !anovaResult && cleanResult && ( 
                <div className="space-y-4 mb-8">
                    <div className="bg-green-900/30 p-4 rounded border border-green-800">
                      <p className="text-green-400 font-bold">Cleaning Complete</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>Rows Before: {cleanResult.initial_rows}</li>
                        <li>Rows After: {cleanResult.final_rows}</li>
                        <li>Dropped: {cleanResult.dropped_rows}</li>
                      </ul>
                    </div>
                </div>
              )}

              {/* Regression Result */}
              {regResult && (
                  <div className="space-y-4 mb-8 bg-black/20 p-4 rounded border border-gray-800">
                      <h3 className="font-bold text-lg text-blue-400">Regression Results</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[var(--bg)] p-3 rounded">
                              <p className="text-xs text-gray-400">R² Score</p>
                              <p className="text-xl font-mono">{regResult.r2_score.toFixed(4)}</p>
                          </div>
                          <div className="bg-[var(--bg)] p-3 rounded">
                              <p className="text-xs text-gray-400">Intercept</p>
                              <p className="text-xl font-mono">{regResult.intercept.toFixed(4)}</p>
                          </div>
                      </div>
                      <div>
                          <p className="text-sm font-semibold mb-2">Coefficients:</p>
                          {Object.entries(regResult.coefficients).map(([feat, coef]) => (
                              <div key={feat} className="flex justify-between text-sm py-1 border-b border-gray-800">
                                  <span>{feat}</span>
                                  <span className="font-mono text-gray-300">{coef.toFixed(4)}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* ANOVA Result */}
              {anovaResult && (
                  <div className="space-y-4 mb-8 bg-black/20 p-4 rounded border border-gray-800">
                      <h3 className="font-bold text-lg text-purple-400">ANOVA Results</h3>
                      <div className={`p-2 rounded text-center font-bold ${anovaResult.status === 'significant' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                          {anovaResult.status === 'significant' ? 'Significant Difference' : 'No Significant Difference'}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-[var(--bg)] p-3 rounded">
                              <p className="text-xs text-gray-400">F-Value</p>
                              <p className="text-xl font-mono">{anovaResult.f_value.toFixed(4)}</p>
                          </div>
                          <div className="bg-[var(--bg)] p-3 rounded">
                              <p className="text-xs text-gray-400">P-Value</p>
                              <p className="text-xl font-mono">{anovaResult.p_value.toExponential(4)}</p>
                          </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                          Groups analyzed: {anovaResult.groups.length}
                      </div>
                  </div>
              )}

              {/* Upload Preview */}
              {uploadData && !stats && !cleanResult && !regResult && !anovaResult && (
                 <div>
                    <h3 className="font-bold text-blue-400 mb-2">Data Preview:</h3>
                    <pre className="text-xs bg-black/50 p-4 rounded overflow-auto">
                      {JSON.stringify(uploadData.preview, null, 2)}
                    </pre>
                 </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
