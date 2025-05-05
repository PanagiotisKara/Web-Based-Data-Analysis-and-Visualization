# Data Visualization and Analysis Application

This application integrates multiple sensor datasets—including air quality, vehicle counts, traffic noise, parking, and EV charging data—to provide interactive, data-driven visualizations and analytical insights. The backend is built with Python Flask, and the frontend leverages dynamic mapping and charting libraries to deliver a responsive dashboard for urban monitoring.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [File Structure](#file-structure)
- [Usage](#usage)
- [License](#license)

## Features

- **Data Ingestion and Pre-Processing:**  
  Loads raw CSV data from various sensors, cleans the data, and uses a hybrid approach to impute missing values by combining SARIMAX, K-Nearest Neighbors (KNN) imputation, and multi-output regression models (using Random Forest).

- **Data Aggregation and Analysis:**  
  Summarizes sensor data by computing minimum, maximum, average, median, and standard deviation over different temporal intervals (e.g., hours, days). Moving averages are applied to smooth out short-term fluctuations, and downsampling techniques ensure efficient rendering in the browser.

- **Interactive Visualization:**  
  Uses Leaflet for dynamic, interactive maps and Plotly for responsive charts, enabling users to explore spatio-temporal patterns and correlations across different sensor types.

- **Customizable Dashboard:**  
  Provides an integrated sensor selection interface with collapsible categories and checkboxes, allowing users to toggle sensor markers and zoom into specific sensor locations on the map.

## Requirements

### Python Libraries

***Install the following Python packages (preferably inside a virtual environment):***

**Flask – Lightweight web framework.**
  ```
  pip install Flask
  ```
**Flask-Caching – Provides caching to improve performance.**
```
  pip install Flask-Caching
```
**pandas – Data manipulation and analysis library.**
```
pip install pandas
```
**NumPy – Fundamental package for numerical computing.**
```
pip install numpy
```
**scikit-learn – Machine learning tools (e.g., KNNImputer, RandomForestRegressor, MultiOutputRegressor).**
```
pip install scikit-learn
```
**statsmodels – Statistical models and SARIMAX for time-series forecasting.**
```
pip install statsmodels
```
***Front-End Libraries***
**The application uses the following front-end libraries (generally referenced via CDNs):**

**jQuery – For DOM manipulation and AJAX calls.**
```
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```
**Leaflet – For interactive maps.**
```
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js"></script>
```
**Plotly – For dynamic charts and visualizations.**
```
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
Custom Scripts – scriptroad.js and detailed_map.js are part of the project’s static assets.
```
## Installation
1. Clone the Repository
**Clone the repository to your local machine:**

```
git clone https://github.com/PanagiotisKara/Web-Based-Data-Analysis-and-Visualization.git
cd Web-Based-Data-Analysis-and-Visualization
```
2. Set Up a Virtual Environment (Recommended)
**Create and activate a virtual environment:**

# For Windows:
```
python -m venv venv
venv\Scripts\activate
```
# For macOS/Linux:
```
python3 -m venv venv
source venv/bin/activate
```
3. Install Python Dependencies
**Install the required packages:**
```
pip install Flask Flask-Caching pandas numpy scikit-learn statsmodels
```
Alternatively, if a requirements.txt file is provided:
```
pip install -r requirements.txt
```
**Start the Flask web server by running:**
```
python app.py
```
**Then, open your web browser and navigate to:**
```
http://127.0.0.1:5000
```
## File Structure
```
├── app.py                     # Flask application and routes
├── data/                      # CSV data files (sensor datasets)
├── templates/
│   ├── index.html             # Main dashboard for Air Quality
│   ├── detailed_map.html      # Detailed sensor map page with legend and interactive controls
│   ├── sound.html             # Sound data visualization page
│   ├── speed.html             # Speed data visualization page
│   ├── vehicle.html           # Vehicle count visualization page
│   └── parking.html           # Parking data visualization page
└── static/
    ├── styleroad.css          # Global CSS styling
    ├── scriptroad.js          # Custom script for maps/charts in main views
    └── detailed_map.js        # Custom script for the detailed sensor map page
```
    
## Usage
Dashboard Navigation:
Use the navigation bar to switch between different pages (Air Quality, Vehicle Count, Speed, Sound, etc.).

Detailed Map and Sensor Legend:
The Detailed Map page displays an interactive Leaflet map with sensor markers. The sensor legend is integrated into the page on the right, grouped by categories (Air Quality, Air Quality Comparison, Traffic Noise, Parking Spots, EV Charging). Each category is collapsible via a toggle button, and a checkbox in the header allows you to show/hide all sensors in that category. Clicking on a sensor in the legend smoothly pans and zooms the map to that location.

Interactive Charts and Analysis:
Data visualizations update dynamically as sensor data is processed and aggregated. Hover interactions and intuitive legends make it easy for users to explore patterns, identify peaks, and assess urban conditions.

## Application preview
https://github.com/PanagiotisKara/Web-Based-Data-Analysis-and-Visualization/blob/main/Application%20preview.mp4

## Update 1.1 05/05/2025
Added eval_imputation and eval_models + updated app.py

eval files evaluate the imputed values, printing in the terminal  MAE (Mean Absolute Error) and RMSE (Root‐Mean‐Squared Error) of the imputed values.

