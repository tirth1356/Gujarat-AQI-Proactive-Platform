import asyncio
import httpx
import logging
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Station, Reading, WeatherReading
# In a real app we would inject db session, here is a standalone script wrapper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GUJARAT_CITIES = [
    {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714, "district": "Ahmedabad"},
    {"name": "Surat", "lat": 21.1702, "lon": 72.8311, "district": "Surat"},
    {"name": "Vadodara", "lat": 22.3072, "lon": 73.1812, "district": "Vadodara"},
    {"name": "Rajkot", "lat": 22.3039, "lon": 70.8022, "district": "Rajkot"},
    {"name": "Gandhinagar", "lat": 23.2156, "lon": 72.6369, "district": "Gandhinagar"},
    {"name": "Bhavnagar", "lat": 21.7645, "lon": 72.1519, "district": "Bhavnagar"},
    {"name": "Jamnagar", "lat": 22.4707, "lon": 70.0577, "district": "Jamnagar"}
]

OPEN_METEO_AQI_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

async def fetch_open_meteo_data():
    async with httpx.AsyncClient() as client:
        for city in GUJARAT_CITIES:
            logger.info(f"Fetching Open-Meteo data for {city['name']}...")
            try:
                # 1. Fetch AQI
                aqi_res = await client.get(
                    OPEN_METEO_AQI_URL,
                    params={
                        "latitude": city["lat"],
                        "longitude": city["lon"],
                        "current": "european_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide"
                    }
                )
                aqi_res.raise_for_status()
                aqi_data = aqi_res.json()
                
                # 2. Fetch Weather
                weather_res = await client.get(
                    OPEN_METEO_WEATHER_URL,
                    params={
                        "latitude": city["lat"],
                        "longitude": city["lon"],
                        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m"
                    }
                )
                weather_res.raise_for_status()
                weather_data = weather_res.json()
                
                logger.info(f"Successfully fetched data for {city['name']}")
                logger.info(f"AQI: {aqi_data['current']}")
                logger.info(f"Weather: {weather_data['current']}")
                
                # TODO: Insert into database once session is configured
                
            except Exception as e:
                logger.error(f"Failed to fetch data for {city['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(fetch_open_meteo_data())
