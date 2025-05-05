import warnings
from statsmodels.tools.sm_exceptions import ValueWarning
warnings.filterwarnings("ignore", category=ValueWarning)

import os
import numpy as np
import pandas as pd
from sklearn.impute import KNNImputer
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "data", "AirQ_imputed.csv")
df_full = pd.read_csv(DATA, parse_dates=["Zeitstempel"])

NON_NUM = {"Zeitstempel", "timestamp_text", "Anfangszeit", "date"}
meas = [
    c for c in df_full.columns
    if c not in NON_NUM and pd.api.types.is_numeric_dtype(df_full[c])
]

rng       = np.random.default_rng(42)
mask_frac = 0.10
df_masked = df_full.copy()
true_vals = {}

for col in meas:
    valid = np.flatnonzero(df_full[col].notna())
    hide_n = int(len(valid) * mask_frac)
    hide_i = rng.choice(valid, size=hide_n, replace=False)
    true_vals[col] = pd.Series(
        df_full.loc[hide_i, col].values,
        index=hide_i
    )
    df_masked.loc[hide_i, col] = np.nan

def hybrid_impute(df, cols, weight=0.7):
    df2     = df.copy()
    bounds  = {c: (df_full[c].min(), df_full[c].max()) for c in cols}

    def arima_fill(series):
        s_obs = series.dropna()
        if len(s_obs) < 10:
            return series.interpolate(method="time", limit_direction="both")
        try:
            mdl = SARIMAX(
                s_obs, order=(1,1,1),
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            res = mdl.fit(disp=False)
            pred = res.get_prediction(
                start=series.index[0],
                end=series.index[-1]
            ).predicted_mean
            out  = series.copy()
            out[out.isna()] = pred[out.isna()]
            return out
        except Exception:
            return series.interpolate(method="time", limit_direction="both")

    for col in cols:
        ts = pd.Series(df2[col].values, index=df2["Zeitstempel"])
        df2[col + "_arima"] = arima_fill(ts).values

    knn_arr = KNNImputer(n_neighbors=5) \
        .fit_transform(df2[cols].astype(float).values)
    knn_df  = pd.DataFrame(knn_arr, columns=cols, index=df2.index)

    for col in cols:
        orig = df2[col].astype(float)
        miss = orig.isna()
        combo = orig.copy()
        combo[miss] = (
            weight * df2.loc[miss, col + "_arima"]
          + (1 - weight) * knn_df.loc[miss, col]
        )
        lo, hi     = bounds[col]
        df2[col]   = combo.clip(lower=lo, upper=hi)
        df2.drop(columns=[col + "_arima"], inplace=True)

    return df2

def compute_avg_errors(weight):
    df_imp = hybrid_impute(df_masked, meas, weight=weight)
    maes, rmses = [], []
    for col in meas:
        pos   = true_vals[col].index.values
        y_t   = true_vals[col].values
        y_p   = df_imp[col].to_numpy()[pos]
        mask  = (~np.isnan(y_t)) & (~np.isnan(y_p))
        y_t0, y_p0 = y_t[mask], y_p[mask]
        maes.append(mean_absolute_error(y_t0, y_p0))
        mse = mean_squared_error(y_t0, y_p0)
        rmses.append(np.sqrt(mse))
    return np.mean(maes), np.mean(rmses)

print(f"{'w':>5}  {'MAE':>10}  {'RMSE':>10}")
for w in np.linspace(0, 1, 11):
    mae_avg, rmse_avg = compute_avg_errors(w)
    print(f"{w:5.1f}  {mae_avg:10.4f}  {rmse_avg:10.4f}")
