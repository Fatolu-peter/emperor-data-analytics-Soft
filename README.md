# Emperor Data Analytics (Soft)

A professional data analysis platform featuring a high-performance **FastAPI** backend and a modern **React/Dex** frontend dashboard.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Emperor+Analytics+Dashboard)

## 🏗 Project Architecture

This repository is a **monorepo** containing two distinct services:

*   **`backend/`**: A Python FastAPI service that handles data processing (Pandas, Scikit-Learn, Scipy).
    *   *Key Features*: CSV/Excel ingestion, Data Cleaning, Linear Regression, ANOVA, JSON-based Visualization Data.
    *   *State*: Uses In-Memory Session Storage (tied to IP/User-Agent).
*   **`frontend/`**: A React-based UI (using the Dex framework) for a dashboard experience.
    *   *Key Features*: Drag-and-drop upload, Interactive Charts (Recharts), Real-time Statistics.

---

## 🚀 Local Development Setup

### 1. Backend Setup (Python)

The backend handles all the heavy lifting for data analysis.

**Prerequisites:** [Install uv](https://github.com/astral-sh/uv) (Recommended) or standard Python 3.10+.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install Dependencies
# Using uv (Recommended for speed):
uv sync

# OR using standard pip:
pip install -r requirements.txt

# 3. Start the Server
uv run uvicorn app.main:app --reload
```
*The API will be available at `http://localhost:8000`*
*API Documentation: `http://localhost:8000/docs`*

### 2. Frontend Setup (React/Dex)

The frontend provides the user interface.

**Prerequisites:** Node.js 18+ and `npm` or `bun`.

```bash
# 1. Navigate to the frontend UI directory
cd frontend/ui

# 2. Install Dependencies
bun install

# 3. Start the Development Server
bun run dev
# OR
dex start
```

note* if you do not have the `dex cli` installed, you should take a look at the documentation at  [Dex framework docs](https://github.com/patrickaigbogun/dex)

*The UI will be available at `http://localhost:3000` (or similar port)*

---

## 🌍 Deployment Guide

Since the project is split into two parts, you should deploy them as separate services.

### 1. Deploying the Backend (e.g., Render, Railway)

The backend requires a Python environment.

*   **Root Directory**: Set your deployment service's root directory to `backend`.
*   **Build Command**: `pip install -r requirements.txt`
*   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
*   **Environment Variables**:
    *   Ensure `PORT` is set (most hosts do this automatically).

### 2. Deploying the Frontend (e.g., Vercel, Netlify)

The frontend is a static React site.

*   **Root Directory**: Set to `frontend/ui`.
*   **Build Command**: `npm run build` (or `dex build`)
*   **Output Directory**: `dist` (or `build` depending on configuration)
*   **Environment Variables**:
    *   Update the API URL in `frontend/ui/core/api/python.ts` to point to your deployed backend URL (e.g., `https://my-backend.onrender.com`).

---

## 🛠 Features

- **Data Ingestion**: Support for `.csv` and `.xlsx` files.
- **Auto-Cleaning**: Intelligent handling of missing values (Numeric Imputation).
- **Descriptive Statistics**: Automatic calculation of Mean, Median, Mode, and Standard Deviation.
- **Statistical Testing**:
    - **Linear Regression**: Calculate R² score, Intercept, and Coefficients.
    - **ANOVA**: One-way Analysis of Variance for group significance testing.
- **Visualization**:
    - Interactive Bar, Line, and Scatter charts using Recharts.

## ⚠️ Notes for Production

- **Session Management**: Currently, the backend uses **In-Memory Storage**. If the server restarts, user data is lost. For a production-grade app with persistent accounts, consider integrating Redis or a SQL Database.
- **Security**: The current session ID is generated based on IP address. For public deployment, implementing proper Authentication (OAuth/JWT) is recommended.
