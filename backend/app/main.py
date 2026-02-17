from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io
import hashlib
from typing import Dict, Any, Optional, List
from sklearn.linear_model import LinearRegression
from scipy import stats
from pydantic import BaseModel

app = FastAPI(title="Emperor Data Analytics Backend")

class RegressionRequest(BaseModel):
    target: str
    features: Optional[List[str]] = None

class AnovaRequest(BaseModel):
    group_col: str
    value_col: str
    
@app.post("/session/current/regression")
async def run_regression(request: Request, params: RegressionRequest):
    """Run Linear Regression on the dataset."""
    session_id = get_session_id(request)
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = SESSIONS[session_id]["df"]
    
    # 1. Prepare Target
    if params.target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{params.target}' not found")
        
    y = df[params.target]
    if not np.issubdtype(y.dtype, np.number):
        raise HTTPException(status_code=400, detail="Target column must be numeric")

    # 2. Prepare Features (X)
    X_cols = []
    if params.features:
        # User selected specific features
        missing = [f for f in params.features if f not in df.columns]
        if missing:
             raise HTTPException(status_code=400, detail=f"Features not found: {missing}")
        X_cols = params.features
    else:
        # Default: Use all other numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        X_cols = [c for c in numeric_df.columns if c != params.target]
    
    if not X_cols:
        raise HTTPException(status_code=400, detail="No numeric features available for regression")

    # Get data and drop rows with NaNs anywhere in X or y
    subset = df[X_cols + [params.target]].dropna()
    
    if subset.empty:
        raise HTTPException(status_code=400, detail="Not enough data after dropping NaNs for regression")
        
    X_train = subset[X_cols]
    y_train = subset[params.target]
    
    # 3. Fit Model
    try:
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        r2 = model.score(X_train, y_train)
        
        # Convert to dictionary {Feature: Coef}
        coef_dict = {feat: float(coef) for feat, coef in zip(X_cols, model.coef_)}
        
        return {
            "r2_score": float(r2),
            "intercept": float(model.intercept_),
            "coefficients": coef_dict,
            "features_used": X_cols,
            "sample_size": len(subset)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regression failed: {str(e)}")

@app.post("/session/current/anova")
async def run_anova(request: Request, params: AnovaRequest):
    """Run One-Way ANOVA."""
    session_id = get_session_id(request)
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = SESSIONS[session_id]["df"]
    
    if params.group_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Group column '{params.group_col}' not found")
    if params.value_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Value column '{params.value_col}' not found")
    
    try:
        # Get groups
        groups = df.groupby(params.group_col)[params.value_col]
        
        arrays = []
        labels = []
        
        for name, group in groups:
            # Filter valid numbers only
            clean_group = [x for x in group if pd.notna(x) and isinstance(x, (int, float, np.number))]
            if len(clean_group) > 0:
                arrays.append(clean_group)
                labels.append(str(name))
        
        if len(arrays) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 valid groups with numeric data for ANOVA")
            
        f_stat, p_value = stats.f_oneway(*arrays)
        
        return {
            "f_value": float(f_stat),
            "p_value": float(p_value),
            "groups": labels,
            "status": "significant" if p_value < 0.05 else "not_significant"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ANOVA failed: {str(e)}")


# Enable CORS for frontend connection (e.g., allow localhost:3000 or your custom domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demonstration (Replace with Redis/DB for production)
# Structure: {session_id: {"df": pd.DataFrame, "meta": meta_info}}
# WARNING: This will vanish on server restart. Suitable for free tier ephemeral instances.
SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_session_id(request: Request) -> str:
    """Generate a consistent session ID based on IP and User-Agent."""
    ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    raw_id = f"{ip}|{user_agent}"
    return hashlib.sha256(raw_id.encode()).hexdigest()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Emperor Analytics Backend Running"}

@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Upload a CSV/Excel file, associated with the user's IP/UA."""
    
    # Generate session ID from IP + User Agent
    session_id = get_session_id(request)
    
    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload .csv or .xlsx")
        
        # Determine numeric columns for safer processing later
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Store in session (In-Memory per instance)
        SESSIONS[session_id] = {
            "df": df,
            "filename": file.filename,
            "numeric_cols": numeric_cols
        }
        
        # Convert preview to valid JSON (handle NaN/Inf)
        preview = df.head(5).replace({np.nan: None}).to_dict(orient="records")
        
        return {
            "session_id": session_id,
            "message": "File uploaded successfully",
            "columns": df.columns.tolist(),
            "numeric_columns": numeric_cols,
            "preview": preview,
            "shape": df.shape
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/session/check")
def check_session(request: Request):
    """Check if the current user has an active session."""
    session_id = get_session_id(request)
    if session_id in SESSIONS:
        df = SESSIONS[session_id]["df"]
        return {
            "exists": True, 
            "filename": SESSIONS[session_id]["filename"],
            "shape": df.shape
        }
    return {"exists": False}

@app.get("/session/current/stats")
def get_stats(request: Request):
    """Get descriptive statistics for the current user's session."""
    session_id = get_session_id(request)
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a file first.")
    
    df = SESSIONS[session_id]["df"]
    
    # Calculate stats
    desc = df.describe().replace({np.nan: None}).to_dict()
    mean_val = df.mean(numeric_only=True).replace({np.nan: None}).to_dict()
    median_val = df.median(numeric_only=True).replace({np.nan: None}).to_dict()
    
    # Mode can return multiple rows, just take the first for simplicity or handle list
    mode_val = df.mode().iloc[0].replace({np.nan: None}).to_dict()

    return {
        "description": desc,
        "mean": mean_val,
        "median": median_val,
        "mode": mode_val
    }

@app.post("/session/current/clean")
def clean_data(request: Request):
    """Clean data for the current user."""
    session_id = get_session_id(request)
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a file first.")
    
    df = SESSIONS[session_id]["df"]
    initial_shape = df.shape
    
    # 1. Drop Duplicates
    df_clean = df.drop_duplicates()
    
    # 2. Fill NA (Numeric only with mean)
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    if not numeric_cols.empty:
        df_clean[numeric_cols] = df_clean[numeric_cols].fillna(df_clean[numeric_cols].mean())
    
    # Update Session
    SESSIONS[session_id]["df"] = df_clean
    SESSIONS[session_id]["numeric_cols"] = numeric_cols.tolist()
    
    final_shape = df_clean.shape
    
    return {
        "message": "Data cleaned successfully",
        "initial_rows": initial_shape[0],
        "final_rows": final_shape[0],
        "dropped_rows": initial_shape[0] - final_shape[0],
        "preview": df_clean.head(5).replace({np.nan: None}).to_dict(orient="records")
    }

@app.get("/session/current/visualization-data")
def get_viz_data(request: Request):
    """Get the full dataset for the current user."""
    session_id = get_session_id(request)
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a file first.")
    
    df = SESSIONS[session_id]["df"]
    
    # Limit to 5000 rows for performance over wire if needed
    # df_sample = df.head(5000) 
    
    # Return JSON compliant records
    # Replace Infinity/NaN with None for valid JSON serialization
    records = df.replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient="records")
    
    return {
        "numeric_columns": SESSIONS[session_id]["numeric_cols"],
        "all_columns": df.columns.tolist(),
        "data_count": len(df),
        "data": records
    }
