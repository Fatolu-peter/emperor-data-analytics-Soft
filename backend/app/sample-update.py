# =========================================================
# EMPEROR DATA ANALYTICS V2 PRO
# WORLD CLASS VERSION
# EXPORT: CSV | EXCEL | PDF | PNG
# =========================================================

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.io as pio

from sklearn.linear_model import LinearRegression
from scipy import stats

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

import io


# =========================================================
# CONFIG
# =========================================================

st.set_page_config(

    page_title="Emperor Data Analytics PRO",
    page_icon="👑",
    layout="wide"

)


# =========================================================
# SESSION
# =========================================================

if "df" not in st.session_state:

    st.session_state.df = None

if "reg_result" not in st.session_state:

    st.session_state.reg_result = None

if "anova_result" not in st.session_state:

    st.session_state.anova_result = None

if "last_fig" not in st.session_state:

    st.session_state.last_fig = None


# =========================================================
# HEADER
# =========================================================

st.title("👑 Emperor Data Analytics PRO")
st.write("Upload • Analyze • Visualize • Export Professional Reports")


# =========================================================
# SIDEBAR MENU
# =========================================================

menu = st.sidebar.selectbox(

"Menu",

[

"Upload",

"Clean",

"Statistics",

"Visualization",

"Regression",

"ANOVA",

"Export Center"

]

)


# =========================================================
# UPLOAD
# =========================================================

if menu == "Upload":

    file = st.file_uploader("Upload CSV or Excel", type=["csv","xlsx"])

    if file:

        if file.name.endswith("csv"):

            df = pd.read_csv(file)

        else:

            df = pd.read_excel(file)

        st.session_state.df = df

        st.dataframe(df)

        st.success("Uploaded Successfully")


# =========================================================
# CLEAN
# =========================================================

elif menu == "Clean":

    df = st.session_state.df

    if df is not None:

        if st.button("Clean Data"):

            df = df.drop_duplicates()

            df = df.fillna(df.mean(numeric_only=True))

            st.session_state.df = df

        st.dataframe(df)


# =========================================================
# STATISTICS
# =========================================================

elif menu == "Statistics":

    df = st.session_state.df

    if df is not None:

        desc = df.describe()

        st.dataframe(desc)


# =========================================================
# VISUAL
# =========================================================

elif menu == "Visualization":

    df = st.session_state.df

    if df is not None:

        col = st.selectbox(

            "Column",

            df.select_dtypes(include=np.number).columns

        )

        fig = px.histogram(df, x=col)

        st.plotly_chart(fig)

        st.session_state.last_fig = fig


# =========================================================
# REGRESSION
# =========================================================

elif menu == "Regression":

    df = st.session_state.df

    if df is not None:

        target = st.selectbox(

            "Target",

            df.select_dtypes(include=np.number).columns

        )

        X = df.drop(target, axis=1).select_dtypes(include=np.number)

        y = df[target]

        model = LinearRegression()

        model.fit(X,y)

        r2 = model.score(X,y)

        result = pd.DataFrame({

        "R2 Score":[r2]

        })

        st.session_state.reg_result = result

        st.success(f"R2 Score: {r2}")


# =========================================================
# ANOVA
# =========================================================

elif menu == "ANOVA":

    df = st.session_state.df

    if df is not None:

        group = st.selectbox("Group", df.columns)

        groups = df.groupby(group)

        arrays = [

        g.select_dtypes(include=np.number).values.flatten()

        for name,g in groups

        ]

        f,p = stats.f_oneway(*arrays)

        result = pd.DataFrame({

        "F Value":[f],

        "P Value":[p]

        })

        st.session_state.anova_result = result

        st.dataframe(result)


# =========================================================
# EXPORT CENTER (PRO FEATURE)
# =========================================================

elif menu == "Export Center":

    df = st.session_state.df

    if df is not None:

        st.header("Download Reports")


        # ==========================
        # EXPORT EXCEL
        # ==========================

        excel_buffer = io.BytesIO()

        with pd.ExcelWriter(

        excel_buffer,

        engine="xlsxwriter"

        ) as writer:

            df.to_excel(writer, sheet_name="Cleaned Data")

            df.describe().to_excel(writer, sheet_name="Statistics")

            if st.session_state.reg_result is not None:

                st.session_state.reg_result.to_excel(

                writer,

                sheet_name="Regression"

                )

            if st.session_state.anova_result is not None:

                st.session_state.anova_result.to_excel(

                writer,

                sheet_name="ANOVA"

                )


        st.download_button(

        "📥 Download Full Excel Report",

        excel_buffer.getvalue(),

        "Emperor_Report.xlsx"

        )


        # ==========================
        # EXPORT CSV
        # ==========================

        csv = df.to_csv(index=False)

        st.download_button(

        "📥 Download CSV",

        csv,

        "data.csv"

        )


        # ==========================
        # EXPORT CHART PNG
        # ==========================

        if st.session_state.last_fig is not None:

            img = pio.to_image(

            st.session_state.last_fig,

            format="png"

            )

            st.download_button(

            "📥 Download Chart PNG",

            img,

            "chart.png"

            )


        # ==========================
        # EXPORT PDF REPORT
        # ==========================

        pdf_buffer = io.BytesIO()

        doc = SimpleDocTemplate(pdf_buffer)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(

        Paragraph(

        "Emperor Data Analytics Report",

        styles["Heading1"]

        )

        )

        elements.append(Spacer(1,10))


        elements.append(

        Paragraph(

        str(df.describe()),

        styles["BodyText"]

        )

        )


        doc.build(elements)


        st.download_button(

        "📥 Download PDF Report",

        pdf_buffer.getvalue(),

        "report.pdf"

        )