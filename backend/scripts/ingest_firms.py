import asyncio
import httpx
import logging
import os
from datetime import datetime
import csv
from io import StringIO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FIRMS API Map Key
FIRMS_API_KEY = os.getenv("FIRMS_API_KEY", "DEMO_KEY")

# Gujarat Bounding Box: min_lon, min_lat, max_lon, max_lat
GUJARAT_BBOX = "68.1,20.1,74.5,24.7"
FIRMS_URL = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{FIRMS_API_KEY}/VIIRS_SNPP_NRT/{GUJARAT_BBOX}/1"

async def fetch_firms_data():
    logger.info(f"Fetching NASA FIRMS data for Gujarat bounds: {GUJARAT_BBOX}...")
    
    if FIRMS_API_KEY == "DEMO_KEY" or not FIRMS_API_KEY:
        logger.warning("No FIRMS_API_KEY found, using a mock response or skipping actual call.")
        # We can simulate data for now
        return
        
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(FIRMS_URL, timeout=30.0)
            res.raise_for_status()
            
            # Parse CSV response
            csv_data = csv.DictReader(StringIO(res.text))
            fires = list(csv_data)
            
            logger.info(f"Successfully fetched {len(fires)} active fire hotspots in Gujarat.")
            for fire in fires[:5]:
                logger.info(f"Fire at ({fire['latitude']}, {fire['longitude']}), FRP: {fire.get('frp')}, Confidence: {fire.get('confidence')}")
                
            # TODO: Insert into database as FireEvent
            
        except Exception as e:
            logger.error(f"Failed to fetch FIRMS data: {e}")

if __name__ == "__main__":
    asyncio.run(fetch_firms_data())
