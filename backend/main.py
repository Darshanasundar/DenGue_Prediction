import random
from datetime import datetime

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


def fetch_owm_weather(city: str) -> dict | None:
    """Fetch real-time weather from OpenWeatherMap. Returns None on failure."""
    try:
        resp = requests.get(
            OWM_BASE_URL,
            params={
                "q": f"{city},IN",
                "appid": OWM_API_KEY,
                "units": "metric"},
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
CITY_PROFILES: dict[str, dict[str, int]] = {
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


def weather_for_city_month(
        city: str, month: int) -> tuple[float, float, float]:
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
        "High": "red"}.get(
        level,
        "gray")


def ml_predict(temp: float, hum: float, rain: float,
               month: int) -> tuple[str, float]:
    """Run the ML model and return (risk_level, confidence_pct)."""
    features = pd.DataFrame([{
        "Temperature": temp,
        "Humidity": hum,
        "Rainfall": rain,
        "Month": month,
    }])
    level = str(model.predict(features)[0])
    probs = model.predict_proba(features)[0]
    confidence = round(float(max(probs)) * 100, 2)
    return level, confidence

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

    level, conf = ml_predict(
        weather["temperature"],
        weather["humidity"],
        weather["rainfall"],
        current_month
    )
    return {
        **weather,
        "month": current_month,
        "risk_level": level,
        "confidence": conf,
        "color": risk_color(level),
        "is_live": is_live,
    }


@app.post("/api/predict-city")
def predict_by_city(data: CityMonthInput):
    """
    Predict dengue risk for a given Indian city and month
    using seasonal profiles.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    t, h, r = weather_for_city_month(data.city, data.month)
    level, conf = ml_predict(t, h, r, data.month)
    return {
        "temperature": round(t, 1),
        "humidity": round(h, 1),
        "rainfall": round(r, 1),
        "risk_level": level,
        "confidence": conf,
        "color": risk_color(level),
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

        if model:
            level, conf = ml_predict(t, h, r, idx)
        else:
            level, conf = "Unknown", 0.0

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
