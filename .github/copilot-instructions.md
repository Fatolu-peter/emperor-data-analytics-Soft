# Copilot Instructions for Emperor Data Analytics

This is a Streamlit-based data analysis application designed for cleaning, analyzing, and visualizing data.

## 🏗 Project Architecture
- **Framework**: Streamlit (Python)
- **Dependency Management**: Uses `uv` for fast, reproducible environments.
- **Entry Point**: `app.py` contains the entire application logic.
- **State Management**: Uses `st.session_state` to persist the dataframe (`df`) across interactions and navigation changes.
- **Navigation**: Sidebar radio button drives the main content area via conditional `if/elif` blocks.

## 📦 Dependencies & Libraries
- **Data Manipulation**: `pandas`, `numpy`, `openpyxl`.
- **Visualization**: `plotly`, `seaborn`, `matplotlib`.
- **Analysis**: `scipy` (stats), `scikit-learn` (linear regression).
- **UI**: Custom CSS injected via `st.markdown(..., unsafe_allow_html=True)`.

## 💻 coding Conventions
- **Data Loading**: ALWAYS check if `df` is in `st.session_state` before accessing it in sub-pages.
- **File Handling**: Support both CSV and Excel uploads. When loading, immediately store in session state.
- **Styling**: Use the existing `.hero` and `.feature` CSS classes for consistent styling.
- **Plotting**: Prefer `plotly.express` for interactive charts, but support `matplotlib`/`seaborn` for static exports if requested.

## 🚀 Common Patterns
- **Data Cleaning**: The app implements simple cleaning (drop duplicates, fill numeric NaNs with mean). Extend this pattern for new cleaning features.
- **Section Logic**:
  ```python
  if menu == "Section Name":
      st.header("Section Header")
      # Check for data existence
      if st.session_state.df is not None:
         # Local logic
  ```

## ⚠️ Critical Constraints
- **Session State**: Streamlit reruns the script on every interaction. Ensure heavy computations are cached or stored in `st.session_state` to avoid performance bottlenecks.
- **HTML Injection**: The app uses `unsafe_allow_html=True`. Be cautious when modifying existing HTML blocks to avoid breaking the layout.

## 🛠 Development Workflow
- **Environment Setup**:
  - Install dependencies: `uv sync`
  - Add package: `uv add package_name`
- **Running the App**:
  - `uv run streamlit run app.py`
