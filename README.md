# Emperor Data Analytics

A data analysis tool for cleaning, analyzing, and visualizing datasets.
Supports both **Streamlit** (Monolithic) and **FastAPI** (Backend for external UI) modes.

## 🚀 Getting Started

This project uses modern Python tooling (`uv`) for fast, isolated environment management.

### Prerequisites

- [Install uv](https://github.com/astral-sh/uv)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emperor-data-analytics-Soft
   ```

2. Sync the environment (installs dependencies):
   ```bash
   uv sync
   ```

## 🖥️ Running the Application

### Option 1: Streamlit (Original)
The classic all-in-one interface.
```bash
uv run streamlit run app.py
```

### Option 2: FastAPI Backend (For External UI)
Run this if you want to connect your custom frontend (e.g., Dex).
```bash
uv run uvicorn backend.app.main:app --reload
```

- **API Docs**: http://localhost:8000/docs
- **API Endpoint**: http://localhost:8000

## 📦 Project Structure

- `app.py`: Streamlit entry point.
- `backend/`: FastAPI implementation.
  - `app/main.py`: API endpoints (Upload, Stats, Clean, Viz).
- `pyproject.toml`: Dependency definitions.
