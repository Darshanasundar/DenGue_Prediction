import random
import uvicorn
import os
from datetime import datetime
from typing import Optional

import joblib
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Dengue Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- ML Model ----------
try:
    model = joblib.load("dengue_model.pkl")
except Exception as e:
    model = None
    print(f"Warning: Could not load model. {e}")

# ---------- OpenWeatherMap ----------
OWM_API_KEY = "ebb418abb7b100805e6e3bf26bd5a483"
OWM_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"


def fetch_owm_weather(city: str) -> Optional[dict]:
    """Fetch real-time weather from OpenWeatherMap. Returns None on failure."""
    try:
        resp = requests.get(
            OWM_BASE_URL,
            params={
                "q": f"{city},IN",
                "appid": OWM_API_KEY,
                "units": "metric",
            },
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "temperature": round(float(data["main"]["temp"]), 1),
            "humidity": round(float(data["main"]["humidity"]), 1),
            "rainfall": round(float(data.get("rain", {}).get("1h", 0.0)), 1),
            "description": data["weather"][0]["description"].title(),
            "city": data["name"],
        }
    except Exception:
        return None


def fetch_owm_weather_by_coords(lat: float, lon: float) -> Optional[dict]:
    """Fetch real-time weather from OpenWeatherMap using coordinates."""
    try:
        resp = requests.get(
            OWM_BASE_URL,
            params={
                "lat": lat,
                "lon": lon,
                "appid": OWM_API_KEY,
                "units": "metric",
            },
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "temperature": round(float(data["main"]["temp"]), 1),
            "humidity": round(float(data["main"]["humidity"]), 1),
            "rainfall": round(float(data.get("rain", {}).get("1h", 0.0)), 1),
            "description": data["weather"][0]["description"].title(),
            "city": data["name"],
        }
    except Exception:
        return None


# ---------- City Weather Profiles ----------
CITY_PROFILES: dict = {
    "Agra": {"temp_base": 25, "hum_base": 50, "rain_base": 15},
    "Ahmedabad": {"temp_base": 29, "hum_base": 55, "rain_base": 15},
    "Amritsar": {"temp_base": 23, "hum_base": 50, "rain_base": 10},
    "Bangalore": {"temp_base": 24, "hum_base": 60, "rain_base": 25},
    "Bhopal": {"temp_base": 25, "hum_base": 50, "rain_base": 20},
    "Bhubaneswar": {"temp_base": 28, "hum_base": 70, "rain_base": 40},
    "Chandigarh": {"temp_base": 24, "hum_base": 50, "rain_base": 15},
    "Chennai": {"temp_base": 30, "hum_base": 70, "rain_base": 40},
    "Dehradun": {"temp_base": 21, "hum_base": 60, "rain_base": 40},
    "Delhi": {"temp_base": 25, "hum_base": 50, "rain_base": 15},
    "Erode": {"temp_base": 29, "hum_base": 65, "rain_base": 30},
    "Faridabad": {"temp_base": 25, "hum_base": 50, "rain_base": 15},
    "Ghaziabad": {"temp_base": 25, "hum_base": 50, "rain_base": 15},
    "Guwahati": {"temp_base": 25, "hum_base": 75, "rain_base": 60},
    "Hyderabad": {"temp_base": 26, "hum_base": 65, "rain_base": 30},
    "Indore": {"temp_base": 25, "hum_base": 50, "rain_base": 20},
    "Jaipur": {"temp_base": 26, "hum_base": 40, "rain_base": 10},
    "Kanpur": {"temp_base": 25, "hum_base": 55, "rain_base": 15},
    "Kochi": {"temp_base": 29, "hum_base": 80, "rain_base": 60},
    "Kolkata": {"temp_base": 27, "hum_base": 75, "rain_base": 60},
    "Lucknow": {"temp_base": 25, "hum_base": 55, "rain_base": 15},
    "Ludhiana": {"temp_base": 24, "hum_base": 50, "rain_base": 10},
    "Meerut": {"temp_base": 24, "hum_base": 55, "rain_base": 15},
    "Mumbai": {"temp_base": 28, "hum_base": 75, "rain_base": 50},
    "Nagpur": {"temp_base": 27, "hum_base": 50, "rain_base": 20},
    "Nashik": {"temp_base": 24, "hum_base": 55, "rain_base": 20},
    "Patna": {"temp_base": 26, "hum_base": 60, "rain_base": 25},
    "Pune": {"temp_base": 25, "hum_base": 60, "rain_base": 20},
    "Rajkot": {"temp_base": 28, "hum_base": 55, "rain_base": 15},
    "Shimla": {"temp_base": 15, "hum_base": 60, "rain_base": 20},
    "Srinagar": {"temp_base": 15, "hum_base": 60, "rain_base": 10},
    "Surat": {"temp_base": 28, "hum_base": 60, "rain_base": 25},
    "Thane": {"temp_base": 28, "hum_base": 75, "rain_base": 50},
    "Thiruvananthapuram": {"temp_base": 28, "hum_base": 80, "rain_base": 50},
    "Vadodara": {"temp_base": 28, "hum_base": 55, "rain_base": 15},
    "Varanasi": {"temp_base": 26, "hum_base": 60, "rain_base": 20},
    "Visakhapatnam": {"temp_base": 28, "hum_base": 70, "rain_base": 30},
}


def weather_for_city_month(city: str, month: int) -> tuple:
    """Return (temp, humidity, rainfall) estimates for a city and month."""
    p = CITY_PROFILES.get(city, CITY_PROFILES["Delhi"])
    temp: float = float(p["temp_base"])
    hum: float = float(p["hum_base"])
    rain: float = float(p["rain_base"])

    if 4 <= month <= 6:       # Pre-monsoon / summer
        temp += 5
        hum -= 10
    elif 7 <= month <= 9:     # Monsoon
        temp -= 2
        hum += 20
        rain += 150
    elif month >= 11 or month <= 2:  # Winter
        temp -= 5
        hum -= 5
        rain -= 10

    return max(15.0, temp), min(100.0, max(30.0, hum)), max(0.0, rain)


def risk_color(level: str) -> str:
    return {
        "Low": "green",
        "Moderate": "yellow",
        "High": "red",
    }.get(level, "gray")


def ml_predict(temp: float, hum: float, rain: float, month: int) -> tuple:
    """Run the ML model and return (risk_level, confidence_pct, feature_impact)."""
    if model is None:
        return "Unknown", 0.0, {}
    
    features = pd.DataFrame([{
        "Temperature": temp,
        "Humidity": hum,
        "Rainfall": rain,
        "Month": month,
    }])
    
    level = str(model.predict(features)[0])
    probs = model.predict_proba(features)[0]
    confidence = round(float(max(probs)) * 100, 2)
    
    # Calculate local feature interpretability (Surrogate Proxy for SHAP/LIME)
    # We compare current values to baseline means (from training data heuristics) to find what's driving the score.
    feature_impact = {}
    if hasattr(model, "feature_importances_"):
        global_imp = dict(zip(features.columns, model.feature_importances_))
        
        # Approximate local impact: Global importance * scaled deviation from mean
        # Assuming training means approx: Temp=28, Hum=70, Rain=50
        deviations = {
            "Temperature": abs(temp - 28) / 10.0,
            "Humidity": abs(hum - 70) / 30.0,
            "Rainfall": abs(rain - 50) / 100.0
        }
        
        # Calculate unnormalized local impact scores
        local_impact = {
            col: global_imp.get(col, 0) * (1.0 + deviations.get(col, 0))
            for col in deviations.keys()
        }
        
        # Normalize to 100%
        total_impact = sum(local_impact.values())
        if total_impact > 0:
            feature_impact = {
                "Temperature Focus": round((local_impact["Temperature"] / total_impact) * 100),
                "Humidity Saturation": round((local_impact["Humidity"] / total_impact) * 100),
                "Precipitation Impact": round((local_impact["Rainfall"] / total_impact) * 100)
            }
        
    return level, confidence, feature_impact


# ---------- Pydantic Models ----------

class CityMonthInput(BaseModel):
    city: str
    month: int


# ---------- Endpoints ----------

@app.get("/api/live-weather")
def live_weather(city: str):
    """Fetch real-time weather (OpenWeatherMap) and predict dengue risk."""
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    current_month = datetime.now().month
    weather = fetch_owm_weather(city)
    is_live = weather is not None

    if not is_live:
        t, h, r = weather_for_city_month(city, current_month)
        weather = {
            "temperature": round(t, 1),
            "humidity": round(h, 1),
            "rainfall": round(r, 1),
            "description": "Estimated (live API unavailable)",
            "city": city,
        }

    level, conf, feature_impact = ml_predict(
        weather["temperature"],
        weather["humidity"],
        weather["rainfall"],
        current_month,
    )
    return {
        **weather,
        "month": current_month,
        "risk_level": level,
        "confidence": conf,
        "color": risk_color(level),
        "is_live": is_live,
        "feature_impact": feature_impact
    }


@app.get("/api/live-location")
def live_location(lat: float, lon: float):
    """Fetch exact live location weather (OWM) by coords and predict."""
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    current_month = datetime.now().month
    weather = fetch_owm_weather_by_coords(lat, lon)
    
    # Fallback bounds if OWM fails (highly unlikely, but safe)
    if not weather:
        weather = {
            "temperature": 28.0,
            "humidity": 65.0,
            "rainfall": 10.0,
            "description": "Satellite Error",
            "city": "Unknown Territory"
        }

    level, conf, feature_impact = ml_predict(
        weather["temperature"],
        weather["humidity"],
        weather["rainfall"],
        current_month,
    )
    return {
        **weather,
        "month": current_month,
        "risk_level": level,
        "confidence": conf,
        "color": risk_color(level),
        "is_live": True,
        "feature_impact": feature_impact
    }


@app.post("/api/predict-city")
def predict_by_city(data: CityMonthInput):
    """Predict dengue risk for a given Indian city and month using seasonal profiles."""
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    t, h, r = weather_for_city_month(data.city, data.month)
    level, conf, feature_impact = ml_predict(t, h, r, data.month)
    return {
        "temperature": round(t, 1),
        "humidity": round(h, 1),
        "rainfall": round(r, 1),
        "risk_level": level,
        "confidence": conf,
        "color": risk_color(level),
        "feature_impact": feature_impact
    }


@app.get("/api/yearly-forecast")
def yearly_forecast(year: int = 2026, city: str = "Delhi"):
    """Generate a 12-month dengue risk forecast for a city and year."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    forecasts = []

    for idx, name in enumerate(months, start=1):
        t_base, h_base, r_base = weather_for_city_month(city, idx)
        t = t_base + random.uniform(-1, 1)
        h = h_base + random.uniform(-4, 4)
        r = max(0.0, r_base + (random.uniform(-15, 20)
                if r_base > 10 else random.uniform(0, 5)))

        level, conf, _ = ml_predict(t, h, r, idx)

        forecasts.append({
            "month": name,
            "month_num": idx,
            "year": year,
            "temperature": round(t, 1),
            "humidity": round(h, 1),
            "rainfall": round(r, 1),
            "risk_level": level,
            "risk_color": risk_color(level),
            "confidence": round(conf, 1),
        })

    return {"forecast": forecasts}


@app.get("/api/historical-cases")
def historical_cases(state: Optional[str] = None):
    """Fetch historical dengue cases and deaths from Kaggle dataset."""
    try:
        csv_path = "/Users/darshana/.cache/kagglehub/datasets/jadhavpranav/dengue-cases-in-india/versions/1/dengue_cases_in_india.csv"
        df = pd.read_csv(csv_path)

        if state and state != "All":
            df = df[df["States"].str.lower() == state.lower()]
            if df.empty:
                raise HTTPException(status_code=404, detail="State not found")

        years = ["2019", "2020", "2021", "2022", "2023", "2024"]
        timeseries = []

        for year in years:
            cases_col = f"{year}_Cases" if year != "2024" else "2024*_Cases"
            deaths_col = f"{year}_Deaths" if year != "2024" else "2024*_Deaths"

            total_cases = pd.to_numeric(df[cases_col], errors="coerce").fillna(0).sum() if cases_col in df.columns else 0
            total_deaths = pd.to_numeric(df[deaths_col], errors="coerce").fillna(0).sum() if deaths_col in df.columns else 0

            timeseries.append({
                "year": year,
                "cases": int(total_cases),
                "deaths": int(total_deaths),
            })

        return {"historical_data": timeseries}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")


# ---------- City-to-State Mapping for Heatmap ----------
CITY_STATE_MAP = {
    "Agra": "Uttar Pradesh", "Ahmedabad": "Gujarat", "Amritsar": "Punjab",
    "Bangalore": "Karnataka", "Bhopal": "Madhya Pradesh", "Bhubaneswar": "Odisha",
    "Chandigarh": "Chandigarh", "Chennai": "Tamil Nadu", "Dehradun": "Uttarakhand",
    "Delhi": "Delhi", "Erode": "Tamil Nadu", "Faridabad": "Haryana",
    "Ghaziabad": "Uttar Pradesh", "Guwahati": "Assam", "Hyderabad": "Telangana",
    "Indore": "Madhya Pradesh", "Jaipur": "Rajasthan", "Kanpur": "Uttar Pradesh",
    "Kochi": "Kerala", "Kolkata": "West Bengal", "Lucknow": "Uttar Pradesh",
    "Ludhiana": "Punjab", "Meerut": "Uttar Pradesh", "Mumbai": "Maharashtra",
    "Nagpur": "Maharashtra", "Nashik": "Maharashtra", "Patna": "Bihar",
    "Pune": "Maharashtra", "Rajkot": "Gujarat", "Shimla": "Himachal Pradesh",
    "Srinagar": "Jammu & Kashmir", "Surat": "Gujarat", "Thane": "Maharashtra",
    "Thiruvananthapuram": "Kerala", "Vadodara": "Gujarat", "Varanasi": "Uttar Pradesh",
    "Visakhapatnam": "Andhra Pradesh",
}


@app.get("/api/city-risk-map")
def city_risk_map():
    """Return dengue risk for ALL cities — used by the India heatmap."""
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    current_month = datetime.now().month
    results = []
    for city in CITY_PROFILES:
        t, h, r = weather_for_city_month(city, current_month)
        level, conf, _ = ml_predict(t, h, r, current_month)
        results.append({
            "city": city,
            "state": CITY_STATE_MAP.get(city, "Unknown"),
            "temperature": round(t, 1),
            "humidity": round(h, 1),
            "rainfall": round(r, 1),
            "risk_level": level,
            "confidence": conf,
            "color": risk_color(level),
        })
    return {"cities": results, "month": current_month}


@app.get("/api/correlation-data")
def correlation_data():
    """Return temp/humidity/rainfall vs risk data for scatter charts."""
    try:
        df = pd.read_csv("historical_dengue_data.csv")
        sample = df.sample(n=min(300, len(df)), random_state=42)
        records = []
        for _, row in sample.iterrows():
            records.append({
                "temperature": round(float(row["Temperature"]), 1),
                "humidity": round(float(row["Humidity"]), 1),
                "rainfall": round(float(row["Rainfall"]), 1),
                "risk_level": str(row["Risk_Level"]),
                "cases": int(row["Dengue_Cases"]),
                "month": int(row["Month"]) if "Month" in row else 1,
            })
        return {"data": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/export-csv")
def export_csv(city: str = "Delhi", year: int = 2026):
    """Generate downloadable CSV of yearly forecast."""
    from fastapi.responses import StreamingResponse
    import io

    months_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    rows = []
    for idx, name in enumerate(months_list, start=1):
        t, h, r = weather_for_city_month(city, idx)
        level, conf, _ = ml_predict(t, h, r, idx)
        rows.append({
            "Month": name, "Year": year, "City": city,
            "Temperature": round(t, 1), "Humidity": round(h, 1),
            "Rainfall": round(r, 1), "Risk_Level": level,
            "Confidence": round(conf, 1),
        })
    output_df = pd.DataFrame(rows)
    buffer = io.StringIO()
    output_df.to_csv(buffer, index=False)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=dengue_forecast_{city}_{year}.csv"},
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # In production (when PORT is set), it's safer to disable reload
    reload = os.environ.get("PORT") is None
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
