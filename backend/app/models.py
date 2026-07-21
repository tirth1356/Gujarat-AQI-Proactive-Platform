from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base
from geoalchemy2 import Geometry
from datetime import datetime

Base = declarative_base()

class Station(Base):
    __tablename__ = 'stations'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String, index=True)
    district = Column(String, index=True) # Gujarat districts
    latitude = Column(Float)
    longitude = Column(Float)
    geom = Column(Geometry(geometry_type='POINT', srid=4326))
    is_active = Column(Boolean, default=True)

class Reading(Base):
    __tablename__ = 'readings'
    
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey('stations.id'))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    aqi = Column(Float)
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    so2 = Column(Float)
    co = Column(Float)
    ozone = Column(Float)
    
class WeatherReading(Base):
    __tablename__ = 'weather_readings'
    
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey('stations.id'))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    wind_direction = Column(Float)
    rainfall = Column(Float)

class FireEvent(Base):
    __tablename__ = 'fire_events'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    confidence = Column(Float)
    frp = Column(Float)
    geom = Column(Geometry(geometry_type='POINT', srid=4326))
    event_type = Column(String) # 'crop', 'forest', 'unknown'
