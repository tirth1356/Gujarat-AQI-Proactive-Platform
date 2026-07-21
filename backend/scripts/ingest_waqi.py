import asyncio
import httpx
import logging
import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import our database models
# We need to add backend to Python path or run as module, but since it's a script we can do relative import or sys.path
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.models import Base, Station, Reading

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WAQI_API_KEY = os.getenv("WAQI_API_KEY", "")
WAQI_SEARCH_URL = "https://api.waqi.info/search/"
DATABASE_URL = os.getenv("DATABASE_URL")

# Major cities in Gujarat to search for
GUJARAT_CITIES = ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Vapi", "Ankleshwar"]

from sqlalchemy import create_engine, text

def get_db_session():
    if not DATABASE_URL or DATABASE_URL == 'p':
        logger.error("DATABASE_URL is not set correctly in .env!")
        return None
        
    engine = create_engine(DATABASE_URL)
    
    # Enable PostGIS extension required by geoalchemy2 (Neon Postgres supports this!)
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
        
    # Create tables if they don't exist
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()

async def fetch_waqi_data():
    logger.info("Fetching real-time AQI data from WAQI for Gujarat...")
    
    if not WAQI_API_KEY:
        logger.error("No WAQI_API_KEY found in environment variables.")
        return
        
    session = get_db_session()
    if not session:
        return
        
    async with httpx.AsyncClient() as client:
        try:
            all_stations = []
            
            # 1. Search for stations in major Gujarat cities (Minimizes API tokens!)
            for city in GUJARAT_CITIES:
                res = await client.get(
                    WAQI_SEARCH_URL,
                    params={"keyword": city, "token": WAQI_API_KEY},
                    timeout=30.0
                )
                res.raise_for_status()
                data = res.json()
                
                if data.get("status") == "ok":
                    stations = data.get("data", [])
                    # Add city name to station dict so we can save it to DB
                    for s in stations:
                        s['_search_city'] = city
                    all_stations.extend(stations)
                    
            logger.info(f"Successfully fetched {len(all_stations)} stations.")
            
            # 2. Upsert into database
            for st in all_stations:
                uid = str(st.get('uid'))
                name = st.get('station', {}).get('name', 'Unknown')
                city = st.get('_search_city')
                lat = st.get('station', {}).get('geo', [None, None])[0]
                lon = st.get('station', {}).get('geo', [None, None])[1]
                
                aqi_val = st.get('aqi')
                # Sometimes WAQI returns '-' if sensor is down
                if aqi_val == '-' or not isinstance(aqi_val, (int, float, str)) or not str(aqi_val).replace('.','',1).isdigit():
                    continue
                    
                aqi_val = float(aqi_val)
                
                # Check if station exists in DB
                db_station = session.query(Station).filter_by(name=name).first()
                if not db_station:
                    db_station = Station(
                        name=name,
                        city=city,
                        latitude=lat,
                        longitude=lon,
                        geom=f"POINT({lon} {lat})" if lon and lat else None,
                        is_active=True
                    )
                    session.add(db_station)
                    session.commit()
                    session.refresh(db_station)
                
                # Insert reading
                reading = Reading(
                    station_id=db_station.id,
                    timestamp=datetime.utcnow(),
                    aqi=aqi_val
                )
                session.add(reading)
                
            session.commit()
            logger.info("Successfully inserted all AQI readings into the database!")
            
        except Exception as e:
            logger.error(f"Failed to fetch or insert WAQI data: {e}")
            session.rollback()
        finally:
            session.close()

if __name__ == "__main__":
    asyncio.run(fetch_waqi_data())
