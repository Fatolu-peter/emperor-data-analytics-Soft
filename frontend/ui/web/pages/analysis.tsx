import { useState, useEffect } from "react";
import { pythonApi, type UploadResponse, type StatsResponse, type CleanResponse, type RegressionResponse, type AnovaResponse, type VizResponse } from "../../core/api/python";
import { Link } from "@dex/router/client";
import { DataUploader } from "../components/analysis/DataUploader";
import { SidebarActions } from "../components/analysis/SidebarActions";
import { ResultsDisplay } from "../components/analysis/ResultsDisplay";
import * as Exports from "../../utils/export";

export default function AnalysisPage() {
  // Global App State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data & Session
  const [file, setFile] = useState<File | null>(null);
  const [session, setSession] = useState<{
    exists: boolean;
    filename?: string;
    shape?: [number, number];
  }>({ exists: false });
  const [columns, setColumns] = useState<string[]>([]);
  
  // Results State
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [cleanResult, setCleanResult] = useState<CleanResponse | null>(null);
  const [regResult, setRegResult] = useState<RegressionResponse | null>(null);
  const [anovaResult, setAnovaResult] = useState<AnovaResponse | null>(null);
  const [vizData, setVizData] = useState<VizResponse | null>(null);

  // Action Configurations
  const [regTarget, setRegTarget] = useState("");
  const [anovaGroup, setAnovaGroup] = useState("");
  const [anovaValue, setAnovaValue] = useState("");
  const [vizType, setVizType] = useState<"Bar" | "Line" | "Scatter">("Bar");
  const [vizX, setVizX] = useState("");
  const [vizY, setVizY] = useState("");

  // Check existing session on mount
  useEffect(() => {
    pythonApi.checkSession().then(async (s) => {
        setSession(s);
        // Note: In a real reload, we'd need to re-fetch columns if session exists
        // simplified for now as session is in-memory backend only
    }).catch(console.error);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await pythonApi.upload(file);
      setUploadData(res);
      setColumns(res.columns);
      setSession({ exists: true, filename: file.name, shape: res.shape });
      
      // Reset Results
      setStats(null);
      setCleanResult(null);
      setRegResult(null);
      setAnovaResult(null);
      setVizData(null);
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
       // Clear others to focus on stats
       setRegResult(null); setAnovaResult(null); setCleanResult(null); setVizData(null);
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
      setStats(null); setRegResult(null); setAnovaResult(null); setVizData(null);
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
          console.log("Running Regression on:", regTarget);
          const res = await pythonApi.runRegression(regTarget);
          console.log("Regression Result:", res);
          setRegResult(res);
          // Clear others
          setStats(null); 
          setCleanResult(null); 
          setAnovaResult(null); 
          setVizData(null);
      } catch(err: any) {
          console.error("Regression Error:", err);
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
          console.log("Running ANOVA on:", anovaGroup, anovaValue);
          const res = await pythonApi.runAnova(anovaGroup, anovaValue);
          console.log("ANOVA Result:", res);
          setAnovaResult(res);
          // Clear others
          setStats(null); 
          setCleanResult(null); 
          setRegResult(null); 
          setVizData(null);
      } catch(err: any) {
          console.error("ANOVA Error:", err);
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleViz = async () => {
    if(!vizX || !vizY) {
        setError("Please select X and Y axes");
        return;
    }
    setLoading(true);
    try {
        const res = await pythonApi.getVizData();
        setVizData(res);
        setStats(null); setCleanResult(null); setRegResult(null); setAnovaResult(null);
    } catch(err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const currentData = cleanResult?.preview || uploadData?.preview || [];

  const handleExportExcel = () => {
      // For full export we need full dataset. 
      // If we only have preview, we might need to fetch full data or warn.
      // Ideally we fetch full data on export if not present.
      // For now, let's assume we use what we have in `vizData` if available, or just the preview for demo if vizData missing
      
      const dataToExport = vizData?.data || currentData;
      
      Exports.exportToExcel({
          filename: session.filename,
          data: dataToExport,
          stats: stats,
          regression: regResult,
          anova: anovaResult
      });
  };

  const handleExportPDF = () => {
      const dataToExport = vizData?.data || currentData;
      Exports.exportToPDF({
          filename: session.filename,
          data: dataToExport,
          stats: stats,
          regression: regResult,
          anova: anovaResult
      });
  };

  const handleExportCSV = () => {
      const dataToExport = vizData?.data || currentData;
      Exports.exportCSV(dataToExport, session.filename || "export");
  };

  const handleExportImage = () => {
      if(!vizData) {
          setError("No chart to export");
          return;
      }
      // Recharts container ID in ResultsDisplay needs to be known. 
      // We will update ResultsDisplay to have an ID on the chart wrapper.
      Exports.exportChartImage("analysis-chart-container", session.filename || "chart");
  };

  // Determine Enabled States based on user rules
  const isVizActive = !!vizData;
  const isAnalysisActive = !!(regResult || anovaResult);
  // Default/Data view is when neither viz nor analysis is active, but we have data
  const isDataActive = !isVizActive && !isAnalysisActive && session.exists;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-blue-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <span className="font-bold text-white text-lg">E</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
                    Emperor Analytics
                </h1>
            </div>
            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5">
                <span>Exit Dashboard</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </Link>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden p-4 lg:p-8 gap-6 max-w-[1600px] mx-auto w-full">
            
            {/* Left Sidebar / Actions */}
            <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                
                {/* Data Upload Card */}
                <DataUploader 
                    onFileSelect={setFile} 
                    onUpload={handleUpload}
                    file={file}
                    loading={loading}
                    session={session}
                />

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in">
                        <span className="text-xl">⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Actions Panel */}
                {session.exists && (
                    <SidebarActions 
                        onStats={fetchStats}
                        onClean={handleClean}
                        onRegression={handleRegression}
                        onAnova={handleAnova}
                        onViz={handleViz}
                        columns={columns}
                        regTarget={regTarget} setRegTarget={setRegTarget}
                        anovaGroup={anovaGroup} setAnovaGroup={setAnovaGroup}
                        anovaValue={anovaValue} setAnovaValue={setAnovaValue}
                        vizType={vizType} setVizType={setVizType}
                        vizX={vizX} setVizX={setVizX}
                        vizY={vizY} setVizY={setVizY}
                        
                        onExportExcel={() => handleExportExcel()}
                        onExportPDF={() => handleExportPDF()}
                        onExportCSV={() => handleExportCSV()}
                        onExportImage={() => handleExportImage()}

                        // State Flags
                        // 1. Chart View: Only Chart enabled
                        // 2. Analysis View (Reg/Anova): Only PDF enabled (user rule)
                        // 3. Data View: Excel, PDF, CSV enabled (Chart disabled)
                        enableExcel={!isVizActive && !isAnalysisActive}
                        enableCSV={!isVizActive && !isAnalysisActive}
                        // PDF is enabled for Analysis AND Data view
                        enablePDF={!isVizActive} 
                        // Image only for Viz view
                        enableImage={isVizActive}
                    />
                )}
            </div>

            {/* Right Display Area */}
            <main className="flex-1 bg-[#0f1012] rounded-2xl border border-white/5 overflow-y-auto p-6 lg:p-10 shadow-inner custom-scrollbar relative">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
                
                <div className="relative">
                    <ResultsDisplay 
                        uploadData={uploadData}
                        stats={stats}
                        cleanResult={cleanResult}
                        regResult={regResult}
                        anovaResult={anovaResult}
                        vizData={vizData}
                        vizType={vizType}
                        vizX={vizX}
                        vizY={vizY}
                    />
                </div>
            </main>
        </div>
      </div>
    </div>
  );
}
