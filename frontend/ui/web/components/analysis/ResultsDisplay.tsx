import React from "react";
import { type UploadResponse, type StatsResponse, type CleanResponse, type RegressionResponse, type AnovaResponse, type VizResponse } from "../../../core/api/python";
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ResultsProps {
  uploadData: UploadResponse | null;
  stats: StatsResponse | null;
  cleanResult: CleanResponse | null;
  regResult: RegressionResponse | null;
  anovaResult: AnovaResponse | null;
  vizData: VizResponse | null;
  vizType: "Bar" | "Line" | "Scatter";
  vizX: string;
  vizY: string;
}

export function ResultsDisplay({
  uploadData,
  stats,
  cleanResult,
  regResult,
  anovaResult,
  vizData,
  vizType,
  vizX,
  vizY
}: ResultsProps) {
  
  if (!stats && !cleanResult && !uploadData && !regResult && !anovaResult && !vizData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
        <span className="text-4xl mb-4">👋</span>
        <p className="font-medium">Welcome to Emperor Analytics</p>
        <p className="text-sm">Upload a dataset and select an action to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        Analysis Results
      </h2>

      {/* Regression Result */}
{regResult && (
        <div className="bg-gradient-to-br from-blue-900/10 to-blue-900/5 border border-blue-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-xl text-blue-300">Regression Model</h3>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
               Linear
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <KeyMetric label="R² Score" value={regResult.r2_score?.toFixed(4) || "N/A"} color="blue" />
              <KeyMetric label="Intercept" value={regResult.intercept?.toFixed(4) || "N/A"} color="blue" />
              <KeyMetric label="Sample Size" value={regResult.sample_size || "N/A"} color="gray" />
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <p className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Coefficients</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regResult.coefficients ? Object.entries(regResult.coefficients).map(([feat, coef]) => (
                    <div key={feat} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded border border-white/5">
                        <span className="text-gray-300 text-sm">{feat}</span>
                        <span className="font-mono text-blue-300">{typeof coef === 'number' ? coef.toFixed(4) : coef}</span>
                    </div>
                )) : <p className="text-gray-500 text-sm italic">No coefficients available</p>}
              </div>
          </div>
        </div>
      )}

      {/* ANOVA Result */}
      {anovaResult && (
        <div className={`bg-gradient-to-br p-6 rounded-2xl shadow-xl backdrop-blur-sm border ${
            anovaResult.status === 'significant' 
            ? 'from-green-900/10 to-green-900/5 border-green-500/20' 
            : 'from-yellow-900/10 to-yellow-900/5 border-yellow-500/20'
        }`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl text-purple-300">ANOVA Test</h3>
              <span className={`px-3 py-1 text-xs rounded-full border ${
                  anovaResult.status === 'significant' 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              }`}>
                  {anovaResult.status === 'significant' ? 'Significant Difference' : 'No Significant Difference'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <KeyMetric label="F-Value" value={anovaResult.f_value?.toFixed(4) || "N/A"} color="purple" />
                <KeyMetric label="P-Value" value={anovaResult.p_value?.toExponential(4) || "N/A"} color="purple" />
            </div>
            
            <p className="mt-4 text-xs text-center text-gray-500">
                Groups analyzed: <span className="text-gray-300">{anovaResult.groups?.join(", ") || "None"}</span>
            </p>
        </div>
      )}

      {/* Visualization */}
      {vizData && (
         <div id="analysis-chart-container" className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-green-400 flex items-center gap-2">
                 <span className="w-2 h-6 bg-green-500 rounded-full"/> 
                 {vizType} Chart
               </h3>
               <div className="text-xs text-gray-500">
                  {vizX} vs {vizY}
               </div>
            </div>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  {vizType === "Bar" ? (
                     <BarChart data={vizData.data}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                       <XAxis dataKey={vizX} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                       <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                          cursor={{fill: '#374151', opacity: 0.2}}
                       />
                       <Legend wrapperStyle={{paddingTop: '20px'}}/>
                       <Bar dataKey={vizY} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  ) : vizType === "Line" ? (
                     <LineChart data={vizData.data}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                       <XAxis dataKey={vizX} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                       <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                       <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                       <Legend wrapperStyle={{paddingTop: '20px'}}/>
                       <Line type="monotone" dataKey={vizY} stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#1d4ed8'}} activeDot={{r: 6}} />
                     </LineChart>
                  ) : (
                     <ScatterChart>
                       <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                       <XAxis type="category" dataKey={vizX} name={vizX} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                       <YAxis type="number" dataKey={vizY} name={vizY} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                       <Legend wrapperStyle={{paddingTop: '20px'}}/>
                       <Scatter name={`${vizX} vs ${vizY}`} data={vizData.data} fill="#3b82f6" />
                     </ScatterChart>
                  )}
               </ResponsiveContainer>
            </div>
         </div>
      )}

      {/* Stats View */}
      {!regResult && !anovaResult && stats && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-sm">
          <h3 className="font-bold text-lg text-white/90 mb-4 border-b border-white/5 pb-2">Descriptive Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h4 className="font-semibold text-blue-400 mb-3 text-sm uppercase tracking-wider">Mean Values</h4>
                <div className="space-y-2">
                  {Object.entries(stats.mean).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1 border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-mono text-white/90">{typeof v === 'number' ? v.toFixed(2) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
             </div>
             <div>
                <h4 className="font-semibold text-purple-400 mb-3 text-sm uppercase tracking-wider">Median Values</h4>
                <div className="space-y-2">
                  {Object.entries(stats.median).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1 border-b border-white/5 hover:bg-white/5 px-2 rounded transition-colors">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-mono text-white/90">{typeof v === 'number' ? v.toFixed(2) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Clean Result View */}
      {!regResult && !anovaResult && cleanResult && ( 
        <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <h3 className="font-bold text-lg text-emerald-400 mb-4 flex items-center gap-2">
                <span className="bg-emerald-500/20 p-1 rounded-full text-xs">✓</span> Cleaning Complete
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-xs text-emerald-500/70 uppercase">Original</div>
                    <div className="text-2xl font-mono text-white">{cleanResult.initial_rows}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                    <div className="text-xs text-emerald-500/70 uppercase">Final</div>
                    <div className="text-2xl font-mono text-white">{cleanResult.final_rows}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-red-500/20">
                    <div className="text-xs text-red-400/70 uppercase">Dropped</div>
                    <div className="text-2xl font-mono text-red-300">{cleanResult.dropped_rows}</div>
                </div>
            </div>
        </div>
      )}

      {/* Simple Data Table / Preview */}
      {uploadData && !stats && !cleanResult && !regResult && !anovaResult && !vizData && (
         <div className="mt-8">
            <h3 className="font-bold text-gray-400 mb-2 flex justify-between items-center">
                <span>Data Preview</span>
                <span className="text-xs font-normal bg-gray-800 px-2 py-1 rounded">JSON View</span>
            </h3>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-auto max-h-[400px]">
              <pre className="text-xs text-green-300/80 font-mono">
                {JSON.stringify(uploadData.preview, null, 2)}
              </pre>
            </div>
         </div>
      )}
    </div>
  );
}

function KeyMetric({ label, value, color }: { label: string, value: string | number, color: string }) {
    let bg = "bg-gray-500/10";
    let text = "text-gray-300";
    if (color === 'blue') { bg = "bg-blue-500/10"; text = "text-blue-300"; }
    if (color === 'purple') { bg = "bg-purple-500/10"; text = "text-purple-300"; }

    return (
        <div className={`p-4 rounded-xl border border-white/5 ${bg} flex flex-col items-center justify-center`}>
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-2xl font-bold font-mono ${text}`}>{value}</span>
        </div>
    )
}
