# Data Visualization and Analysis Application

This application integrates various sensor datasets (including air quality, vehicle counts, traffic noise, parking, and EV charging) to provide interactive visualizations and analytical insights. The backend is built using Python Flask, while the frontend leverages libraries such as Leaflet and Plotly.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [File Structure](#file-structure)
- [Usage](#usage)
- [License](#license)

## Features

- **Data Ingestion and Pre-processing:** Loads data from CSV files, cleans data, and fills missing values using a hybrid approach that combines SARIMAX, KNN imputation, and multi-output regression.
- **Interactive Visualizations:** Displays dynamic, responsive charts and maps using Plotly and Leaflet.
- **Spatio-Temporal Analysis:** Visualizes sensor data on maps with time-aware charts.
- **Customizable Dashboard:** Offers sensor selection and filtering options for a tailored analysis experience.

## Requirements

### Python Libraries

Install the following Python packages (preferably within a virtual environment):

- **Flask**  
  ```bash
  pip install Flask
  pip install Flask-Caching
  pip install numpy
  pip install scikit-learn
  pip install statsmodels


