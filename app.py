import json  
from flask import Flask, render_template, jsonify, request
import pandas as pd
import os
import time
from flask_caching import Cache
from sklearn.impute import KNNImputer
import numpy as np
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
import math
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import warnings
warnings.filterwarnings("ignore", message="A date index has been provided, but it has no associated frequency information")

app = Flask(__name__)

#Flask-Caching
app.config['CACHE_TYPE'] = 'SimpleCache'  
app.config['CACHE_DEFAULT_TIMEOUT'] = 400  
cache = Cache(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FOLDER = os.path.join(BASE_DIR, "data")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/detailed_map")
def detailed_map():
    return render_template("detailed_map.html")

@app.route("/sound")
def sound():
    return render_template("sound.html")

@app.route("/speed")
def speed():
    return render_template("speed.html")

@app.route("/vehicle")
def vehicle():
    return render_template("vehicle.html") 

@app.route("/parking")
def parking():
    return render_template("parking.html")

@app.route("/echarging")
def echarging():
    return render_template("echarging.html")

def profile_endpoint(func):
    from functools import wraps
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start_time
        app.logger.info(f"{func.__name__} ολοκληρώθηκε σε {elapsed:.2f} δευτερόλεπτα")
        return result
    return wrapper

@app.route("/get_road_data")
@cache.cached()
@profile_endpoint
def get_road_data():
    AirQ_csv = os.path.join(CSV_FOLDER, "AirQ.csv")
    AirQComp_csv = os.path.join(CSV_FOLDER, "AirQComp.csv")
    imputed_file = os.path.join(CSV_FOLDER, "AirQ_imputed.csv")
    
    if not os.path.exists(AirQ_csv):
        return jsonify({"error": "δεν βρέθηκε AirQ.csv"}), 404
    if not os.path.exists(AirQComp_csv):
        return jsonify({"error": "δεν βρέθηκε AirQComp.csv"}), 404

    try:
        if os.path.exists(imputed_file):
            df_all = pd.read_csv(imputed_file, parse_dates=["Zeitstempel"])
            df_all["Zeitstempel"] = pd.to_datetime(df_all["Zeitstempel"], utc=True)
            non_numeric_cols = {"Zeitstempel", "timestamp_text", "Anfangszeit", "date"}
            for col in df_all.columns:
                if col not in non_numeric_cols:
                    df_all[col] = pd.to_numeric(df_all[col], errors='coerce')
        else:
            app.logger.info("Το Imputed αρχείο δεν βρέθηκε - επεξεργασία δεδομένων...")

            df = pd.read_csv(AirQ_csv, sep=None, engine="python", on_bad_lines="skip")
            expected_cols = [
                "Zeitstempel", "G107 NO2", "G107 O3", "G107 PM2.5",
                "G125 NO2", "G125 O3", "G125 PM2.5",
                "G131 NO2", "G131 O3", "G131 PM2.5",
                "timestamp_text", "Anfangszeit"
            ]
            if df.shape[1] == 12:
                df.columns = expected_cols

            df["Zeitstempel"] = pd.to_datetime(df["Zeitstempel"], errors="coerce", utc=True)
            df.dropna(subset=["Zeitstempel"], inplace=True)

            df_comp = pd.read_csv(AirQComp_csv, sep=None, engine="python", on_bad_lines="skip")
            if df_comp.shape[1] == 12:
                df_comp.columns = [
                    "Zeitstempel", "A2Hard NO2", "A2Hard O3", "A2Hard PM2.5",
                    "Feld NO2", "Feld O3", "Feld PM2.5",
                    "StJohanns NO2", "StJohanns O3", "StJohanns PM2.5",
                    "timestamp_text", "Anfangszeit"
                ]
            else:
                msg = f"AirQComp.csv έχει {df_comp.shape[1]} στήλες, έπρεπε 12"
                app.logger.error(msg)
                return jsonify({"error": msg}), 500

            df_comp["Zeitstempel"] = pd.to_datetime(df_comp["Zeitstempel"], errors="coerce", utc=True)
            df_comp.dropna(subset=["Zeitstempel"], inplace=True)

            df_all = pd.concat([df, df_comp], ignore_index=True, sort=False)
            df_all["date"] = df_all["Zeitstempel"].dt.date

            exclude_cols = {"Zeitstempel", "timestamp_text", "Anfangszeit", "date"}
            measure_cols = [c for c in df_all.columns if c not in exclude_cols and pd.api.types.is_numeric_dtype(df_all[c])]
            
            original_bounds = {}
            for col in measure_cols:
                observed = df_all[col].dropna()
                if not observed.empty:
                    original_bounds[col] = (observed.min(), observed.max())
                else:
                    original_bounds[col] = (None, None)

            # --- ARIMA and KNN---
            df_all.sort_values("Zeitstempel", inplace=True)
            df_all.set_index("Zeitstempel", inplace=True)

            def arima_impute(series):
                s_obs = series.dropna()
                if len(s_obs) < 10:
                    return series.interpolate(method="time", limit_direction="both")
                try:
                    model = SARIMAX(s_obs, order=(1, 1, 1), enforce_stationarity=False, enforce_invertibility=False)
                    res = model.fit(disp=False)
                    pred = res.get_prediction(start=series.index[0], end=series.index[-1])
                    pred_mean = pred.predicted_mean
                    series_imputed = series.copy()
                    series_imputed[series_imputed.isna()] = pred_mean[series_imputed.isna()]
                    return series_imputed
                except Exception as e:
                    return series.interpolate(method="time", limit_direction="both")

            arima_imputed = {}
            for col in measure_cols:
                series = df_all[col].astype(float)
                arima_imputed[col] = arima_impute(series)

            knn_imputer = KNNImputer(n_neighbors=5)
            arr = df_all[measure_cols].values.astype(float)
            knn_imputed_arr = knn_imputer.fit_transform(arr)
            knn_imputed_df = pd.DataFrame(knn_imputed_arr, index=df_all.index, columns=measure_cols)
            
            weight = 0.7 
            for col in measure_cols:
                series_orig = df_all[col].astype(float)
                missing_mask = series_orig.isna()
                combined_series = series_orig.copy()
                combined_series[missing_mask] = (
                    weight * arima_imputed[col][missing_mask] + 
                    (1 - weight) * knn_imputed_df[col][missing_mask]
                )
                df_all[col] = combined_series

            for col in measure_cols:
                lower_bound, upper_bound = original_bounds.get(col, (None, None))
                if lower_bound is not None and upper_bound is not None:
                    df_all[col] = df_all[col].clip(lower=lower_bound, upper=upper_bound)

            df_all.reset_index(inplace=True)
            df_all.to_csv(imputed_file, index=False)

        df_all["date"] = df_all["Zeitstempel"].dt.date
        non_numeric_cols = {"Zeitstempel", "timestamp_text", "Anfangszeit", "date"}
        measure_cols = [c for c in df_all.columns if c not in non_numeric_cols and pd.api.types.is_numeric_dtype(df_all[c])]

        daily_means = (
            df_all.groupby("date")[measure_cols]
            .mean(numeric_only=True)
            .reset_index()
            .to_dict("records")
        )
        daily_medians = (
            df_all.groupby("date")[measure_cols]
            .median(numeric_only=True)
            .reset_index()
            .to_dict("records")
        )
        stats = {}
        for c in measure_cols:
            stats[c] = {
                "min": df_all[c].min(skipna=True),
                "max": df_all[c].max(skipna=True),
                "avg": df_all[c].mean(skipna=True),
                "median": df_all[c].median(skipna=True),
                "std": df_all[c].std(skipna=True)
            }

        def clean_value(value):
            if pd.isna(value):
                return None
            if isinstance(value, (np.generic,)):
                return value.item()
            return value

        def clean_dict(d):
            return {k: clean_value(v) for k, v in d.items()}

        daily_means = [clean_dict(rec) for rec in daily_means]
        daily_medians = [clean_dict(rec) for rec in daily_medians]
        stats = {k: {kk: clean_value(vv) for kk, vv in v.items()} for k, v in stats.items()}

        return jsonify({
            "daily_means": daily_means,
            "daily_medians": daily_medians,
            "stats": stats
        })

    except Exception as e:
        app.logger.error(f"Error in get_road_data: {e}")
        return jsonify({"error": str(e)}), 500
 
@app.route("/get_corr_matrix")
@cache.cached()
@profile_endpoint
def get_corr_matrix():
    try:
        df_all = pd.read_csv(os.path.join(CSV_FOLDER, "AirQ_imputed.csv"), parse_dates=["Zeitstempel"])
        df_all["Zeitstempel"] = pd.to_datetime(df_all["Zeitstempel"], utc=True)
        
        non_numeric_cols = {"Zeitstempel", "timestamp_text", "Anfangszeit", "date"}
        measure_cols = [col for col in df_all.columns 
                        if col not in non_numeric_cols and pd.api.types.is_numeric_dtype(df_all[col])]

        corr_matrix = df_all[measure_cols].corr().fillna(0)
        return jsonify(corr_matrix.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_vehicle_data")
@cache.cached()
@profile_endpoint
def get_vehicle_data():
    csv_path = os.path.join(CSV_FOLDER, "VechicleC.csv")
    if not os.path.exists(csv_path):
        return jsonify({"error": "δεν βρέθηκε VechicleC.csv"}), 404
    try:
        df = pd.read_csv(csv_path, sep=None, engine="python", on_bad_lines='skip')
        df["Zeitstempel"] = pd.to_datetime(df["Zeitstempel"], errors="coerce", utc=True)
        df.dropna(subset=["Zeitstempel"], inplace=True)
        df["day"] = df["Zeitstempel"].dt.date
        group_df = df.groupby(["day", "Fahrzeugklasse"]).size().reset_index(name="count")
        pivot_df = group_df.pivot(index="day", columns="Fahrzeugklasse", values="count").fillna(0)
        for vehicle_type in ["Car", "Truck / Bus", "Bicycle / Motorbike", "Van / Suv"]:
            if vehicle_type not in pivot_df.columns:
                pivot_df[vehicle_type] = 0
        pivot_df = pivot_df[["Car", "Truck / Bus", "Bicycle / Motorbike", "Van / Suv"]]
        pivot_df = pivot_df.reset_index()
        pivot_data = pivot_df.to_dict("records")
        return jsonify(pivot_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_spso_data")
@cache.cached()
@profile_endpoint
def get_spso_data():
    try:
        cache_file = os.path.join(CSV_FOLDER, "SpSo_imputed_cache.json")

        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r") as f:
                    cached_response = json.load(f)
                return jsonify(cached_response)
            except Exception as cache_err:
                app.logger.error(f"Error reading cache file: {cache_err}")
                os.remove(cache_file)

        csv_path = os.path.join(CSV_FOLDER, "SpSo.csv")
        df = pd.read_csv(csv_path, sep=None, engine="python", on_bad_lines='skip')
        df.columns = (
            df.columns.str.encode("ascii", "ignore").str.decode("ascii")
            .str.replace(r"[^A-Za-z0-9_\-\.\s]+", "", regex=True)
            .str.strip()
        )

        df["Startzeit"] = pd.to_datetime(
            df["Startzeit"], format="%Y-%m-%dT%H:%M:%S%z", errors="coerce", utc=True
        )
        df["Startzeit"] = df["Startzeit"].dt.tz_convert(None)
        df["day"] = df["Startzeit"].dt.date

        for col in ["Geschwindigkeit", "Schalldruckpegel", "Fahrzeug-Zufallszahl"]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        grouped = df.groupby("day").agg({
            "Fahrzeug-Zufallszahl": "sum",
            "Geschwindigkeit": "mean",
            "Schalldruckpegel": "mean"
        }).reset_index()

        grouped.rename(columns={
            "Fahrzeug-Zufallszahl": "vehicle_count",
            "Geschwindigkeit": "avg_speed",
            "Schalldruckpegel": "avg_sound"
        }, inplace=True)

        grouped["day"] = pd.to_datetime(grouped["day"])
        full_range = pd.date_range(start=grouped["day"].min(), end=grouped["day"].max(), freq='D')
        grouped = grouped.set_index("day").reindex(full_range)
        grouped.index.name = "day"
        grouped = grouped.reset_index()
        grouped["day_dt"] = pd.to_datetime(grouped["day"])

        grouped["day"] = grouped["day"].dt.strftime("%Y-%m-%d")

        grouped["weekday"] = pd.to_datetime(grouped["day"]).dt.weekday
        grouped["day_of_year"] = pd.to_datetime(grouped["day"]).dt.dayofyear

        grouped["lag_speed_1"] = grouped["avg_speed"].shift(1)
        grouped["lag_speed_2"] = grouped["avg_speed"].shift(2)
        grouped["lag_sound_1"] = grouped["avg_sound"].shift(1)
        grouped["lag_sound_2"] = grouped["avg_sound"].shift(2)
        grouped["lag_count_1"] = grouped["vehicle_count"].shift(1)
        grouped["lag_count_2"] = grouped["vehicle_count"].shift(2)

        features = [
            "weekday", "day_of_year",
            "lag_speed_1", "lag_speed_2",
            "lag_sound_1", "lag_sound_2",
            "lag_count_1", "lag_count_2"
        ]
        targets = ["avg_speed", "avg_sound", "vehicle_count"]

        train_data = grouped.dropna(subset=targets + features)
        if not train_data.empty:
            X_train = train_data[features]
            y_train = train_data[targets]

            model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42))
            model.fit(X_train, y_train)

            missing_mask = grouped[targets].isna().any(axis=1)
            if missing_mask.any():
                predict_data = grouped.loc[missing_mask].copy()
                lag_cols = ["lag_speed_1", "lag_speed_2", "lag_sound_1", "lag_sound_2", "lag_count_1", "lag_count_2"]
                for col in lag_cols:
                    predict_data[col] = predict_data[col].ffill()
                X_pred = predict_data[features]
                y_pred_rf = model.predict(X_pred)

                weight = 0.7  
                arima_preds = {}
                for target in targets:
                    ts = grouped.set_index("day_dt")[target]
                    ts_obs = ts.dropna()
                    if len(ts_obs) < 10:
                        arima_pred = ts.interpolate(method="time", limit_direction="both")
                    else:
                        try:
                            model_arima = SARIMAX(ts_obs, order=(1, 1, 1),
                                                   enforce_stationarity=False,
                                                   enforce_invertibility=False)
                            res_arima = model_arima.fit(disp=False)
                            arima_pred = res_arima.get_prediction(start=ts.index[0], end=ts.index[-1]).predicted_mean
                        except Exception as e:
                            arima_pred = ts.interpolate(method="time", limit_direction="both")
                    arima_preds[target] = arima_pred

                missing_indices = grouped[missing_mask].index
                combined_preds = []
                for k, idx in enumerate(missing_indices):
                    combined_row = []
                    for j, target in enumerate(targets):
                        day_val = grouped.loc[idx, "day_dt"]
                        arima_value = arima_preds[target].get(day_val, np.nan)
                        rf_value = y_pred_rf[k, j]
                        combined_val = weight * arima_value + (1 - weight) * rf_value
                        combined_row.append(combined_val)
                    combined_preds.append(combined_row)
                combined_preds = np.array(combined_preds)
                grouped.loc[missing_mask, targets] = combined_preds

        grouped.set_index("day_dt", inplace=True)
        grouped[targets] = grouped[targets].interpolate(method="time", limit_direction="both")
        grouped.reset_index(inplace=True)

        grouped = grouped.where(pd.notnull(grouped), None)

        def clean_record(record):
            cleaned = {}
            for key, value in record.items():
                if pd.isna(value):
                    cleaned[key] = None
                elif isinstance(value, (np.generic,)):
                    cleaned[key] = value.item()
                elif isinstance(value, pd.Timestamp):
                    cleaned[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    cleaned[key] = value
            return cleaned

        daily_data = [clean_record(r) for r in grouped.to_dict("records")]

        speed_values = [r["avg_speed"] for r in daily_data if r["avg_speed"] is not None and r["avg_speed"] > 0]
        sound_values = [r["avg_sound"] for r in daily_data if r["avg_sound"] is not None and r["avg_sound"] > 0]

        daily_speed_min = min(speed_values) if speed_values else None
        daily_speed_max = max(speed_values) if speed_values else None
        daily_speed_avg = sum(speed_values) / len(speed_values) if speed_values else None
        daily_speed_median = float(np.median(speed_values)) if speed_values else None

        daily_sound_min = min(sound_values) if sound_values else None
        daily_sound_max = max(sound_values) if sound_values else None
        daily_sound_avg = sum(sound_values) / len(sound_values) if sound_values else None
        daily_sound_median = float(np.median(sound_values)) if sound_values else None

        instantaneous_speed_max = float(df["Geschwindigkeit"].max()) if not pd.isna(df["Geschwindigkeit"].max()) else None
        instantaneous_sound_max = float(df["Schalldruckpegel"].max()) if not pd.isna(df["Schalldruckpegel"].max()) else None
        instantaneous_vehicle_max = float(df["Fahrzeug-Zufallszahl"].max()) if not pd.isna(df["Fahrzeug-Zufallszahl"].max()) else None

        def safe_val(val):
            return val if val is not None else 0

        overall_stats = {
            "daily_speed_min": safe_val(daily_speed_min),
            "daily_speed_max": safe_val(daily_speed_max),
            "daily_speed_avg": safe_val(daily_speed_avg),
            "daily_speed_median": safe_val(daily_speed_median),
            "daily_sound_min": safe_val(daily_sound_min),
            "daily_sound_max": safe_val(daily_sound_max),
            "daily_sound_avg": safe_val(daily_sound_avg),
            "daily_sound_median": safe_val(daily_sound_median),
            "instantaneous_speed_max": safe_val(instantaneous_speed_max),
            "instantaneous_sound_max": safe_val(instantaneous_sound_max),
            "instantaneous_vehicle_max": safe_val(instantaneous_vehicle_max),
            "speed_min": safe_val(daily_speed_min),
            "speed_max": safe_val(daily_speed_max),
            "speed_avg": safe_val(daily_speed_avg),
            "sound_min": safe_val(daily_sound_min),
            "sound_max": safe_val(daily_sound_max),
            "sound_avg": safe_val(daily_sound_avg)
        }

        result = {
            "daily_data": daily_data,
            "overall_stats": overall_stats
        }

        with open(cache_file, "w") as f:
            json.dump(result, f)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    
@app.route("/get_soundHz_data")
@cache.cached()
@profile_endpoint
def get_soundHz_data():
    sound_csv_path = os.path.join(CSV_FOLDER, "SoundHzDB.csv")
    if not os.path.exists(sound_csv_path):
        return jsonify({"error": "SoundHzDB.csv not found"}), 404
    try:
        df = pd.read_csv(sound_csv_path, sep=";", engine="python", on_bad_lines='skip')
        df.columns = df.columns.str.strip()
        if "Zeitstempel" in df.columns:
            df["Zeitstempel"] = pd.to_datetime(df["Zeitstempel"], errors="coerce", utc=True)
        freq_cols = [col for col in df.columns if "Hz" in col or "Mittelungspegel" in col]
        for c in freq_cols:
            df[c] = df[c].astype(str).str.replace(",", ".").astype(float, errors="raise")
        if "Zeitstempel" in df.columns:
            df["Zeitstempel"] = df["Zeitstempel"].apply(lambda x: x.isoformat() if pd.notnull(x) else None)
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_parking_data")
@cache.cached()
@profile_endpoint
def get_parking_data():
    csv_path = os.path.join(CSV_FOLDER, "Parking.csv")
    if not os.path.exists(csv_path):
        return jsonify({"error": "Parking.csv not found"}), 404
    try:
        df = pd.read_csv(csv_path, sep=";", engine="python", on_bad_lines="skip")
        df.columns = df.columns.str.strip()

        required_cols = [
            "von", "bis", "Typ", 
            "Summe Zufahrten", "Summe Wegfahrten", "Auslastung (Mittelwert in %)"
        ]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise KeyError(f"Columns not found in Parking.csv: {missing}. Found columns: {list(df.columns)}")
        
        df["von"] = pd.to_datetime(df["von"], errors="coerce", utc=True)
        df["bis"] = pd.to_datetime(df["bis"], errors="coerce", utc=True)
        df.dropna(subset=["von", "bis"], inplace=True)

        numeric_cols = ["Summe Zufahrten", "Summe Wegfahrten", "Auslastung (Mittelwert in %)"]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        
        df["von_local"] = df["von"].dt.tz_convert("Europe/Zurich")
        df = df[df["von_local"].dt.hour.between(7, 18)]
        df.drop(columns=["von_local"], inplace=True)
        df.rename(columns={
            "von": "start_time",
            "bis": "end_time",
            "Typ": "parking_type",
            "Summe Zufahrten": "entries",
            "Summe Wegfahrten": "exits",
            "Auslastung (Mittelwert in %)": "occupancy"
        }, inplace=True)
        
        df["start_time"] = df["start_time"].apply(lambda x: x.isoformat() if pd.notnull(x) else None)
        df["end_time"] = df["end_time"].apply(lambda x: x.isoformat() if pd.notnull(x) else None)
        
        data = df.to_dict(orient="records")
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error in get_parking_data: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_echarging_data")
def get_echarging_data():
    try:
        csv_path = os.path.join(CSV_FOLDER, "Ecar.csv")
        df = pd.read_csv(csv_path, sep=";", engine="python", on_bad_lines='skip')
        
        df = df.replace({np.nan: None})
        
        data_records = df.to_dict(orient="records")
        
        for record in data_records:
            for key, value in record.items():
                if isinstance(value, float) and math.isnan(value):
                    record[key] = None
        
        return jsonify(data_records)
    except Exception as e:
        print("Error in /get_echarging_data:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)