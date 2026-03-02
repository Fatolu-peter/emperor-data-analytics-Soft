import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// --- Types ---
interface RegressionResult {
  r2_score: number;
  intercept: number;
  coefficients: Record<string, number>;
  sample_size: number;
}

interface AnovaResult {
  f_value: number;
  p_value: number;
  groups: string[];
  status: string;
}

interface ExportData {
  filename?: string;
  data: any[];
  stats?: any; // Describe output
  regression?: RegressionResult | null;
  anova?: AnovaResult | null;
}

// --- Excel Export ---
export const exportToExcel = ({ filename, data, stats, regression, anova }: ExportData) => {
  const wb = XLSX.utils.book_new();
  const safeFilename = (filename || "export").replace(/\.[^/.]+$/, "");

  // Sheet 1: Data
  if (data && data.length > 0) {
    const wsData = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, wsData, "Cleaned Data");
  }

  // Sheet 2: Statistics
  if (stats) {
    // Transform stats object to array of objects for sheet
    // Assumes stats structure like { mean: {col: val}, median: {col: val} ... }
    // Or pandas describe output: { col: { count, mean, std ... } }
    
    // Let's assume it matches the `StatsResponse` from python API which is:
    // { description: { col: { count, ... } }, mean: {...}, ... }
    // We'll use the 'description' part if available, or just flatten whatever we have
    
    let statsData: any[] = [];
    if (stats.description) {
         // Pivot: Rows are metrics, Cols are features
         // actually pandas describe returns object of objects { col: { metric: val } }
         // We want to format it as a table
         const metrics = ["count", "mean", "std", "min", "25%", "50%", "75%", "max"];
         const cols = Object.keys(stats.description);
         
         statsData = metrics.map(metric => {
             const row: any = { Metric: metric };
             cols.forEach(col => {
                 row[col] = stats.description[col][metric];
             });
             return row;
         });
    }
    
    const wsStats = XLSX.utils.json_to_sheet(statsData.length ? statsData : [{Info: "No valid stats data"}]);
    XLSX.utils.book_append_sheet(wb, wsStats, "Statistics");
  }

  // Sheet 3: Regression
  if (regression) {
    const regMetrics = [
      { Metric: "R2 Score", Value: regression.r2_score },
      { Metric: "Intercept", Value: regression.intercept },
      { Metric: "Sample Size", Value: regression.sample_size },
    ];
    
    const coefs = Object.entries(regression.coefficients).map(([feat, coef]) => ({
      Feature: feat,
      Coefficient: coef
    }));

    // Combine into one sheet with spacing
    const wsReg = XLSX.utils.json_to_sheet(regMetrics);
    XLSX.utils.sheet_add_json(wsReg, coefs, { origin: "A6" });
    XLSX.utils.book_append_sheet(wb, wsReg, "Regression");
  }

  // Sheet 4: ANOVA
  if (anova) {
    const anovaData = [{
      "F Value": anova.f_value,
      "P Value": anova.p_value,
      "Groups": anova.groups.join(", "),
      "Status": anova.status
    }];
    const wsAnova = XLSX.utils.json_to_sheet(anovaData);
    XLSX.utils.book_append_sheet(wb, wsAnova, "ANOVA");
  }

  XLSX.writeFile(wb, `${safeFilename}_Report.xlsx`);
};

// --- PDF Export ---
export const exportToPDF = ({ filename, data, stats, regression, anova }: ExportData) => {
  const doc = new jsPDF();
  const safeFilename = (filename || "export").replace(/\.[^/.]+$/, "");
  let y = 15;

  // Title
  doc.setFontSize(18);
  doc.text("Emperor Data Analytics Report", 14, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Filename: ${safeFilename}`, 14, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;

  // Stats
  if (stats && stats.description) {
      doc.setFontSize(14);
      doc.text("Descriptive Statistics", 14, y);
      y += 5;
      
      const cols = Object.keys(stats.description);
      const rows = cols.map(col => [
          col,
          parseFloat(stats.description[col].mean).toFixed(2),
          parseFloat(stats.description[col].std).toFixed(2),
          parseFloat(stats.description[col].min).toFixed(2),
          parseFloat(stats.description[col].max).toFixed(2)
      ]);
      
      autoTable(doc, {
          startY: y,
          head: [["Column", "Mean", "Std", "Min", "Max"]],
          body: rows,
          theme: 'grid'
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
  }

  // Regression
  if (regression) {
      doc.setFontSize(14);
      doc.text("Regression Analysis", 14, y);
      y += 6;
      
      doc.setFontSize(11);
      doc.text(`R2 Score: ${regression.r2_score.toFixed(4)}`, 14, y);
      y += 5;
      doc.text(`Intercept: ${regression.intercept.toFixed(4)}`, 14, y);
      y += 8;
      
      const coefRows = Object.entries(regression.coefficients).map(([k, v]) => [k, v.toFixed(4)]);
      
      autoTable(doc, {
          startY: y,
          head: [["Feature", "Coefficient"]],
          body: coefRows,
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
  }

  // ANOVA
  if (anova) {
      doc.setFontSize(14);
      doc.text("ANOVA Results", 14, y);
      y += 6;
      doc.setFontSize(11);
      doc.text(`F-Value: ${anova.f_value.toFixed(4)}`, 14, y);
      y += 5;
      doc.text(`P-Value: ${anova.p_value.toFixed(4)}`, 14, y);
      y += 5;
      doc.text(`Result: ${anova.status}`, 14, y);
      y += 5;
      doc.text(`Groups: ${anova.groups.join(", ")}`, 14, y);
  }

  doc.save(`${safeFilename}_Report.pdf`);
};

// --- Image Export ---
export const exportChartImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("Chart element not found");
        return;
    }
    
    try {
        const canvas = await html2canvas(element, {
            backgroundColor: "#0F1012", // Match your dark theme
            scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `${filename}_Chart.png`;
        link.href = canvas.toDataURL();
        link.click();
    } catch (err) {
        console.error("Image export failed", err);
    }
};

// --- CSV Export (Simple) ---
export const exportCSV = (data: any[], filename: string) => {
    if(!data || !data.length) return;
    
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
