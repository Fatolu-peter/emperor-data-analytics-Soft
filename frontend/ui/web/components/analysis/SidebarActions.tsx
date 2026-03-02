import React from "react";

interface SidebarProps {
  onStats: () => void;
  onClean: () => void;
  onRegression: () => void;
  onAnova: () => void;
  onViz: () => void;
  columns: string[];
  
  // Regression State
  regTarget: string;
  setRegTarget: (val: string) => void;
  
  // ANOVA State
  anovaGroup: string;
  setAnovaGroup: (val: string) => void;
  anovaValue: string;
  setAnovaValue: (val: string) => void;

  // Viz State
  vizType: "Bar" | "Line" | "Scatter";
  setVizType: (val: "Bar" | "Line" | "Scatter") => void;
  vizX: string;
  setVizX: (val: string) => void;
  vizY: string;
  setVizY: (val: string) => void;

  // Exports
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onExportImage?: () => void;

  // Export State Props
  enableExcel?: boolean;
  enablePDF?: boolean;
  enableCSV?: boolean;
  enableImage?: boolean;
}

export function SidebarActions({
  onStats,
  onClean,
  onRegression,
  onAnova,
  onViz,
  columns,
  regTarget,
  setRegTarget,
  anovaGroup,
  setAnovaGroup,
  anovaValue,
  setAnovaValue,
  vizType,
  setVizType,
  vizX,
  setVizX,
  vizY,
  setVizY,
  
  onExportExcel,
  onExportPDF,
  onExportCSV,
  onExportImage,

  enableExcel = true,
  enablePDF = true,
  enableCSV = true,
  enableImage = true
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
          <span className="bg-blue-500/20 p-1 rounded text-blue-400">⚙️</span> Actions
        </h2>
        
        <div className="space-y-3">
          <ActionButton onClick={onStats} label="Get Descriptive Statistics" icon="📊" />
          <ActionButton onClick={onClean} label="Clean Data (Auto-Fix)" icon="🧹" />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-300 uppercase tracking-wider">
          Testing & Models
        </div>

        {/* Regression */}
        <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3 transition-all hover:border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">📈 Linear Regression</span>
          </div>
          <select
            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
            value={regTarget}
            onChange={(e) => setRegTarget(e.target.value)}
          >
            <option value="">Target Variable (Y)</option>
            {columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={onRegression}
            className="w-full py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 text-xs font-semibold rounded text-white shadow-lg shadow-blue-900/10 transition-all transform active:scale-95"
          >
            Run Model
          </button>
        </div>

        {/* ANOVA */}
        <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3 transition-all hover:border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">🧪 ANOVA</span>
          </div>
          <select
            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
            value={anovaGroup}
            onChange={(e) => setAnovaGroup(e.target.value)}
          >
            <option value="">Group Column (Categorical)</option>
            {columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
            value={anovaValue}
            onChange={(e) => setAnovaValue(e.target.value)}
          >
            <option value="">Value Column (Numeric)</option>
            {columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={onAnova}
            className="w-full py-2 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 text-xs font-semibold rounded text-white shadow-lg shadow-purple-900/10 transition-all transform active:scale-95"
          >
            Test Significance
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-green-300 uppercase tracking-wider">
           Visualization
        </label>
        
        <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3 transition-all hover:border-green-500/30">
            <div className="flex rounded-md bg-black/40 p-1">
                {(["Bar", "Line", "Scatter"] as const).map((type) => (
                <button
                    key={type}
                    onClick={() => setVizType(type)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                    vizType === type ? "bg-green-600/80 text-white shadow" : "text-gray-400 hover:text-white"
                    }`}
                >
                    {type}
                </button>
                ))}
            </div>

            <select
                className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-500/50"
                value={vizX}
                onChange={(e) => setVizX(e.target.value)}
            >
                <option value="">X Axis</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
                className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-500/50"
                value={vizY}
                onChange={(e) => setVizY(e.target.value)}
            >
                <option value="">Y Axis</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
                onClick={onViz}
                className="w-full py-2 bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-600 hover:to-green-700 text-xs font-semibold rounded text-white shadow-lg shadow-green-900/10 transition-all transform active:scale-95"
            >
                Generate Chart
            </button>
        </div>
      </div>

       {/* Export Center */}
       <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-orange-300 uppercase tracking-wider">
           Export Center
        </label>
        
        <div className="grid grid-cols-2 gap-2">
            <ExportButton 
                onClick={onExportExcel} 
                label="Excel" 
                icon="📊" 
                color="bg-green-700/40 border-green-500/30" 
                disabled={!enableExcel}
            />
            <ExportButton 
                onClick={onExportPDF} 
                label="PDF" 
                icon="📄" 
                color="bg-red-700/40 border-red-500/30" 
                disabled={!enablePDF}
            />
            <ExportButton 
                onClick={onExportCSV} 
                label="CSV" 
                icon="📝" 
                color="bg-blue-700/40 border-blue-500/30" 
                disabled={!enableCSV}
            />
            <ExportButton 
                onClick={onExportImage} 
                label="Chart" 
                icon="🖼️" 
                color="bg-purple-700/40 border-purple-500/30" 
                disabled={!enableImage}
            />
        </div>
      </div>
    </aside>
  );
}

function ExportButton({ onClick, label, icon, color, disabled }: any) {
    if (!onClick) return null;
    
    // Disabled styling
    const baseStyle = "flex flex-col items-center justify-center p-3 rounded-lg border transition-all";
    const activeStyle = `hover:brightness-110 active:scale-95 ${color}`;
    const disabledStyle = "opacity-30 grayscale cursor-not-allowed bg-gray-800/40 border-gray-700";

    return (
        <button 
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`${baseStyle} ${disabled ? disabledStyle : activeStyle}`}
        >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-xs font-medium text-gray-200">{label}</span>
        </button>
    )
}

function ActionButton({ onClick, label, icon }: { onClick: () => void; label: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full group px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg transition-all flex items-center justify-between"
    >
      <span className="text-gray-300 group-hover:text-white text-sm font-medium">{label}</span>
      <span className="text-xl opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform">{icon}</span>
    </button>
  );
}
