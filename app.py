# =========================================================
# EMPEROR DATA ANALYTICS WEB SOFTWARE
# Created by Emperor Data Analytics
# Streamlit Version
# =========================================================

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

import seaborn as sns
import matplotlib.pyplot as plt

from scipy import stats
from sklearn.linear_model import LinearRegression


# =========================================================
# PAGE CONFIG
# =========================================================

st.set_page_config(

    page_title="Emperor Data Analytics",
    page_icon="👑",
    layout="wide"

)


# =========================================================
# LANDING PAGE DESIGN (ZENROWS STYLE)
# =========================================================

st.markdown("""

<style>

.hero {

background: linear-gradient(135deg, #0A0F2C, #1B2AFF);

padding: 60px;

border-radius: 20px;

color: white;

text-align: center;

}

.feature {

background: white;

padding: 20px;

border-radius: 15px;

box-shadow: 0px 5px 15px rgba(0,0,0,0.1);

}

</style>

""", unsafe_allow_html=True)


st.markdown("""

<div class="hero">

<h1>👑 Emperor Data Analytics</h1>

<h3>World-Class Data Analysis Software</h3>

<p>

Upload your data. Clean. Analyze. Visualize. Predict.

All in One Click.

</p>

</div>

""", unsafe_allow_html=True)


# =========================================================
# SIDEBAR
# =========================================================

st.sidebar.title("Navigation")

menu = st.sidebar.radio(

"Select Option",

[

"Upload Data",

"Data Cleaning",

"Descriptive Statistics",

"Visualization",

"Regression",

"ANOVA",

"3D Chart"

]

)


# =========================================================
# LOAD DATA
# =========================================================

if "df" not in st.session_state:

    st.session_state.df = None


if menu == "Upload Data":

    st.header("Upload Dataset")

    file = st.file_uploader(

        "Upload Excel or CSV",

        type=["csv", "xlsx"]

    )

    if file:

        if file.name.endswith(".csv"):

            df = pd.read_csv(file)

        else:

            df = pd.read_excel(file)

        st.session_state.df = df

        st.success("Data Loaded Successfully")

        st.dataframe(df)


# =========================================================
# DATA CLEANING
# =========================================================

elif menu == "Data Cleaning":

    st.header("Clean Data")

    df = st.session_state.df

    if df is not None:

        if st.button("Clean Data"):

            df = df.drop_duplicates()

            df = df.fillna(df.mean(numeric_only=True))

            st.session_state.df = df

            st.success("Data Cleaned")

        st.dataframe(df)


# =========================================================
# DESCRIPTIVE STATS
# =========================================================

elif menu == "Descriptive Statistics":

    st.header("Statistics")

    df = st.session_state.df

    if df is not None:

        st.subheader("Descriptive Statistics")

        st.dataframe(df.describe())

        st.subheader("Mean")

        st.write(df.mean(numeric_only=True))

        st.subheader("Median")

        st.write(df.median(numeric_only=True))

        st.subheader("Mode")

        st.write(df.mode())


# =========================================================
# VISUALIZATION
# =========================================================

elif menu == "Visualization":

    st.header("Charts")

    df = st.session_state.df

    if df is not None:

        col = st.selectbox(

            "Select Column",

            df.select_dtypes(include=np.number).columns

        )

        chart = st.selectbox(

            "Select Chart",

            [

                "Histogram",

                "Boxplot",

                "Scatter",

                "Line",

                "Bar",

                "Correlation Heatmap"

            ]

        )

        if chart == "Histogram":

            fig = px.histogram(df, x=col)

            st.plotly_chart(fig)


        elif chart == "Boxplot":

            fig = px.box(df, y=col)

            st.plotly_chart(fig)


        elif chart == "Scatter":

            fig = px.scatter(df, x=df.index, y=col)

            st.plotly_chart(fig)


        elif chart == "Line":

            fig = px.line(df, y=col)

            st.plotly_chart(fig)


        elif chart == "Bar":

            fig = px.bar(df, y=col)

            st.plotly_chart(fig)


        elif chart == "Correlation Heatmap":

            corr = df.corr(numeric_only=True)

            fig = px.imshow(corr)

            st.plotly_chart(fig)


# =========================================================
# REGRESSION
# =========================================================

elif menu == "Regression":

    st.header("Regression Analysis")

    df = st.session_state.df

    if df is not None:

        target = st.selectbox(

            "Target Column",

            df.select_dtypes(include=np.number).columns

        )

        X = df.drop(target, axis=1)

        X = X.select_dtypes(include=np.number)

        y = df[target]

        model = LinearRegression()

        model.fit(X, y)

        r2 = model.score(X, y)

        st.success(f"R² Score: {r2:.4f}")


# =========================================================
# ANOVA
# =========================================================

elif menu == "ANOVA":

    st.header("ANOVA Analysis")

    df = st.session_state.df

    if df is not None:

        column = st.selectbox(

            "Select Group Column",

            df.columns

        )

        groups = df.groupby(column)

        arrays = [

            group.select_dtypes(include=np.number).values.flatten()

            for name, group in groups

        ]

        f, p = stats.f_oneway(*arrays)

        st.write("F value:", f)

        st.write("P value:", p)


# =========================================================
# 3D CHART
# =========================================================

elif menu == "3D Chart":

    st.header("3D Visualization")

    df = st.session_state.df

    if df is not None:

        numeric = df.select_dtypes(include=np.number)

        if len(numeric.columns) >= 3:

            fig = px.scatter_3d(

                numeric,

                x=numeric.columns[0],

                y=numeric.columns[1],

                z=numeric.columns[2]

            )

            st.plotly_chart(fig)

