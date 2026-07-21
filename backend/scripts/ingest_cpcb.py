import asyncio
import httpx
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_GOV_IN_API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "DEMO_KEY")
CPCB_RESOURCE_ID = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
CPCB_BASE_URL = "https://api.data.gov.in/resource"

# We only care about Gujarat states in the CPCB API
GUJARAT_STATE_STRING = "Gujarat"

async def fetch_cpcb_data():
    logger.info("Fetching CPCB data for Gujarat from data.gov.in...")
    
    if DATA_GOV_IN_API_KEY == "DEMO_KEY" or not DATA_GOV_IN_API_KEY:
        logger.warning("No DATA_GOV_IN_API_KEY found, skipping actual call.")
        return
        
    url = f"{CPCB_BASE_URL}/{CPCB_RESOURCE_ID}"
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(
                url,
                params={
                    "api-key": DATA_GOV_IN_API_KEY,
                    "format": "json",
                    "filters[state]": GUJARAT_STATE_STRING,
                    "limit": 1000
                },
                timeout=30.0
            )
            res.raise_for_status()
            data = res.json()
            records = data.get("records", [])
            
            logger.info(f"Successfully fetched {len(records)} CAAQMS records for Gujarat.")
            
            # Print a sample
            for record in records[:5]:
                logger.info(f"Station: {record.get('station')} - {record.get('city')}, Pollutant: {record.get('pollutant_id')}, Value: {record.get('pollutant_avg')}")
                
            # TODO: Aggregate and insert into database
            
        except Exception as e:
            logger.error(f"Failed to fetch CPCB data: {e}")

if __name__ == "__main__":
    asyncio.run(fetch_cpcb_data())
