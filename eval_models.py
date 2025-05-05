import warnings
from statsmodels.tools.sm_exceptions import ValueWarning
warnings.filterwarnings("ignore", category=ValueWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

import json
import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt


def load_and_mask(json_path="data/SpSo_imputed_cache.json", missing_frac=0.1, random_seed=42):
    with open(json_path, 'r') as f:
        data = json.load(f)
    df = pd.DataFrame(data['daily_data'])
    df['day_dt'] = pd.to_datetime(df['day_dt'])
    df.set_index('day_dt', inplace=True)
    measure_cols = ['avg_speed', 'avg_sound', 'vehicle_count']
    df_true = df[measure_cols].copy()
    
    rng = np.random.RandomState(random_seed)
    mask_array = (df_true.notna()).values & (rng.rand(*df_true.shape) < missing_frac)
    mask = pd.DataFrame(mask_array, index=df_true.index, columns=measure_cols)
    df_input = df_true.copy()
    df_input[mask] = np.nan
    
    return df_true, df_input, measure_cols, mask

def arima_impute(series):
    s_obs = series.dropna()
    if len(s_obs) < 10:
        return series.interpolate(method='time', limit_direction='both')
    try:
        model = SARIMAX(s_obs, order=(1,1,1), enforce_stationarity=False, enforce_invertibility=False)
        res = model.fit(disp=False)
        pred = res.get_prediction(start=series.index[0], end=series.index[-1])
        pm = pred.predicted_mean.reindex(series.index).fillna(method='bfill').fillna(method='ffill')
        series_imputed = series.copy()
        series_imputed[series_imputed.isna()] = pm[series_imputed.isna()]
        return series_imputed
    except Exception:
        return series.interpolate(method='time', limit_direction='both')

def rf_impute(df_input, measure_cols, mask):
    df_feat = df_input.copy()
    df_feat['weekday'] = df_feat.index.weekday
    df_feat['day_of_year'] = df_feat.index.dayofyear
    lag_cols = []
    for target in measure_cols:
        base = 'speed' if target=='avg_speed' else 'sound' if target=='avg_sound' else 'count'
        for lag in [1,2]:
            col = f'lag_{base}_{lag}'
            df_feat[col] = df_input[target].shift(lag)
            lag_cols.append(col)
    feature_cols = ['weekday','day_of_year'] + lag_cols
    df_feat[lag_cols] = df_feat[lag_cols].ffill()

    train_mask = ~mask.any(axis=1) & df_feat[feature_cols].notna().all(axis=1)
    X_train = df_feat.loc[train_mask, feature_cols]
    y_train = df_input.loc[train_mask, measure_cols]
    rf = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42))
    rf.fit(X_train, y_train)

    predict_mask = mask.any(axis=1) & df_feat[feature_cols].notna().all(axis=1)
    X_pred = df_feat.loc[predict_mask, feature_cols]
    y_pred = pd.DataFrame(rf.predict(X_pred), index=X_pred.index, columns=measure_cols)

    df_rf = df_input.copy()
    for c in measure_cols:
        df_rf.loc[y_pred.index, c] = y_pred[c]
    return df_rf

def combine_imputations(df_input, measure_cols, mask, weight):
    arima_imp = pd.DataFrame({c: arima_impute(df_input[c]) for c in measure_cols}, index=df_input.index)
    rf_imp = rf_impute(df_input, measure_cols, mask)
    df_comb = df_input.copy()
    for c in measure_cols:
        idx = mask[c]
        df_comb.loc[idx, c] = weight * arima_imp.loc[idx, c] + (1 - weight) * rf_imp.loc[idx, c]
    df_comb = df_comb.interpolate(method='time', limit_direction='both')
    return df_comb

def evaluate(df_true, df_imputed, measure_cols, mask):
    metrics = {}
    for c in measure_cols:
        idx = mask[c]
        if idx.sum() == 0:
            metrics[c] = (np.nan, np.nan)
        else:
            y_true = df_true.loc[idx, c]
            y_imp = df_imputed.loc[idx, c]
            mae = mean_absolute_error(y_true, y_imp)
            rmse = np.sqrt(mean_squared_error(y_true, y_imp))
            metrics[c] = (mae, rmse)
    return metrics

def main():
    df_true, df_input, measure_cols, mask = load_and_mask()

    print("=== Diagnostic: Comparing ARIMA vs RF imputations on masked entries ===")
    arima_imp = pd.DataFrame({c: arima_impute(df_input[c]) for c in measure_cols}, index=df_input.index)
    rf_imp = rf_impute(df_input, measure_cols, mask)
    for c in measure_cols:
        idx_c = mask[c]
        if idx_c.sum() == 0:
            continue
        sample_idx = df_input.loc[idx_c].head().index
        print(f"Column {c} - first 5 masked positions:")
        print("ARIMA:", arima_imp.loc[sample_idx, c].values)
        print("RF:    ", rf_imp.loc[sample_idx, c].values)

    weights = np.linspace(0, 1, 11)
    results = []

    for w in weights:
        df_imp = combine_imputations(df_input, measure_cols, mask, w)
        metrics = evaluate(df_true, df_imp, measure_cols, mask)
        print(f"\nWeight={w:.1f}:")
        for c, (mae, rmse) in metrics.items():
            print(f"  {c:12s} -> MAE={mae:.4f}, RMSE={rmse:.4f}")
        results.append((w, metrics))

    print("\n=== Summary of best weights per measure ===")
    for c in measure_cols:
        valid = [(w, m[c][0], m[c][1]) for w, m in results if not np.isnan(m[c][0])]
        if not valid:
            continue
        best_mae = min(valid, key=lambda x: x[1])
        best_rmse = min(valid, key=lambda x: x[2])
        print(f"{c:12s}: Best MAE at w={best_mae[0]:.1f} -> MAE={best_mae[1]:.4f}")
        print(f"{'':12s}  Best RMSE at w={best_rmse[0]:.1f} -> RMSE={best_rmse[2]:.4f}")

    ws = [w for w, _ in results]
    plt.figure()
    for c in measure_cols:
        maes = [metrics[c][0] for _, metrics in results]
        rmses = [metrics[c][1] for _, metrics in results]
        plt.plot(ws, maes, marker='o', label=f'{c} MAE')
        plt.plot(ws, rmses, marker='s', linestyle='--', label=f'{c} RMSE')
    plt.xlabel('ARIMA weight')
    plt.ylabel('Error')
    plt.title('Imputation weight sweep per measure')
    plt.legend()
    plt.grid(True)
    plt.savefig('imputation_weight_sweep.png')
    print("\nPlot saved to imputation_weight_sweep.png")

if __name__ == '__main__':
    main()
