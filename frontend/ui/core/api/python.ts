export interface UploadResponse {
  session_id: string;
  message: string;
  columns: string[];
  numeric_columns: string[];
  preview: Record<string, any>[];
  shape: [number, number];
}

export interface StatsResponse {
  description: Record<string, Record<string, number>>;
  mean: Record<string, number>;
  median: Record<string, number>;
  mode: Record<string, any>;
}

export interface CleanResponse {
  message: string;
  initial_rows: number;
  final_rows: number;
  dropped_rows: number;
  preview: Record<string, any>[];
}

export interface VizResponse {
  numeric_columns: string[];
  all_columns: string[];
  data_count: number;
  data: Record<string, any>[];
}

export interface RegressionResponse {
  r2_score: number;
  intercept: number;
  coefficients: Record<string, number>;
  features_used: string[];
  sample_size: number;
}

export interface AnovaResponse {
  f_value: number;
  p_value: number;
  groups: string[];
  status: "significant" | "not_significant";
}

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8000";

export const pythonApi = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<UploadResponse>;
  },

  async runRegression(target: string, features?: string[]) {
      const res = await fetch(`${API_BASE}/session/current/regression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, features })
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Regression failed");
      }
      return res.json() as Promise<RegressionResponse>;
  },

  async runAnova(group_col: string, value_col: string) {
      const res = await fetch(`${API_BASE}/session/current/anova`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_col, value_col })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "ANOVA failed");
      }
      return res.json() as Promise<AnovaResponse>;
  },


  async getStats() {
    const res = await fetch(`${API_BASE}/session/current/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json() as Promise<StatsResponse>;
  },

  async cleanData() {
    const res = await fetch(`${API_BASE}/session/current/clean`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Cleaning failed");
    return res.json() as Promise<CleanResponse>;
  },

  async getVizData() {
    const res = await fetch(`${API_BASE}/session/current/visualization-data`);
    if (!res.ok) throw new Error("Failed to fetch viz data");
    return res.json() as Promise<VizResponse>;
  },

  async checkSession() {
      const res = await fetch(`${API_BASE}/session/check`);
      return res.json() as Promise<{ exists: boolean, filename?: string, shape?: [number, number] }>;
  }
};
