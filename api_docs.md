# FarmRisk API Documentation

This document describes all API endpoints currently available in the FarmRisk application, their purpose, methods, file locations, request/response formats, and external services they interact with.

---

## Table of Contents
1. [AI Advisory Endpoints](#1-ai-advisory)
2. [Authentication Endpoints](#2-authentication)
3. [Crop and Calendar Endpoints](#3-crop-and-calendar)
4. [Location Endpoints](#4-location)
5. [Weather and Moisture Endpoints](#5-weather-and-moisture)

---

## 1. AI Advisory

### POST `/api/ai`
- **File Location**: [app/api/ai/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/ai/route.ts)
- **Purpose**: Interacts with the RAG (Retrieval-Augmented Generation) Advisory Model to retrieve AI agricultural recommendations for farmers.
- **Environment Dependency**: `ADVISORY_MODEL_URL`
- **Request Body**:
  ```json
  {
    "query": "What steps should I take for cotton crop in heavy rainfall?"
  }
  ```
- **Response Payload**:
  ```json
  {
    "success": true,
    "advisory_summary": "Summary text from advisory model...",
    "translated": false,
    "language": "en",
    "sources": []
  }
  ```

### POST `/api/ai/weather-summary`
- **File Location**: [app/api/ai/weather-summary/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/ai/weather-summary/route.ts)
- **Purpose**: Generates an AI-powered summary of weather conditions tailored to farming based on incoming weather forecast data.
- **Environment Dependency**: `ADVISORY_MODEL_URL`
- **Request Body**:
  ```json
  {
    "forecast_data": { ... }
  }
  ```
- **Response Payload**:
  ```json
  {
    "success": true,
    "weather_summary": "Detailed summary of weather impact on crops...",
    "translated": false,
    "language": "en"
  }
  ```

---

## 2. Authentication

### POST `/api/auth/reset-password`
- **File Location**: [app/api/auth/reset-password/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/auth/reset-password/route.ts)
- **Purpose**: Initiates password reset procedures for phone-number based credentials. Under the hood, phone numbers are associated with virtual email addresses (`<phone>@farmrisk.app`).
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "newPassword": "newSecurePassword123"
  }
  ```
- **Response Payload**:
  ```json
  {
    "success": true,
    "message": "If an account exists for this phone number, password reset instructions have been sent."
  }
  ```

### POST `/api/profile/update-phone`
- **File Location**: [app/api/profile/update-phone/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/profile/update-phone/route.ts)
- **Purpose**: Authenticates the logged-in user and updates their registered phone number. This performs an atomic RPC update inside Supabase database, falling back to a profile metadata rewrite if RPC fails.
- **Request Body**:
  ```json
  {
    "phone": "9988776655"
  }
  ```
- **Response Payload**:
  ```json
  {
    "success": true,
    "phone": "9988776655",
    "email": "9988776655@farmrisk.app"
  }
  ```

---

## 3. Crop and Calendar

### GET/POST `/api/calender`
- **File Location**: [app/api/calender/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/calender/route.ts)
- **Purpose**: Fetches historical sowing and harvesting calendar cycles from local dataset. It accepts coordinates (performs reverse geocoding to resolve state & district names) or explicit region strings.
- **Dataset**: `data/clean_crop_calendar_with_categories.csv`
- **Parameters**:
  - `lat` / `lng` (or `lon`) : Coordinates for lookup.
  - `state` / `district` : Specific location names.
  - `crop` : Optional crop type filter (e.g. `cotton`, `wheat`, `rice`).
- **Response Payload**:
  ```json
  {
    "success": true,
    "state": "Punjab",
    "district": "Amritsar",
    "districtCode": "0302",
    "calendar": [
      {
        "crop": "Paddy",
        "season": "Kharif",
        "sowingPeriod": "June-July",
        "harvestingPeriod": "October-November",
        "sowFromDay": 1,
        "sowFromMon": 6,
        "sowToDay": 31,
        "sowToMon": 7,
        "harvFromDay": 1,
        "harvFromMon": 10,
        "harvToDay": 30,
        "harvToMon": 11
      }
    ]
  }
  ```

### GET `/api/crops`
- **File Location**: [app/api/crops/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/crops/route.ts)
- **Purpose**: Computes nearest district using the Haversine formula from a local crop dataset based on the user's coordinates and returns the top 10 crops grown there ranked by cultivation area.
- **Dataset**: `data/cropsData.csv`
- **Query Parameters**:
  - `lat` : User latitude (required)
  - `lng` : User longitude (required)
- **Response Payload**:
  ```json
  {
    "success": true,
    "district": "Ahmedabad",
    "state": "Gujarat",
    "distanceKm": 12.45,
    "crops": [
      {
        "id": "cotton",
        "name": "Cotton",
        "area": 450.5
      },
      ...
    ]
  }
  ```

---

## 4. Location

### GET `/api/locations`
- **File Location**: [app/api/locations/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/locations/route.ts)
- **Purpose**: Offers geocoding capabilities.
  1. **Fuzzy Search Autocomplete**: Returns query matches.
  2. **Reverse Geocoding**: Converts latitude & longitude coordinates into administrative districts & states.
- **Multi-Provider Fallback Flow**: Ola Maps API -> LocationIQ API -> OpenStreetMap Nominatim.
- **Query Parameters**:
  - `mode`: `"search"` or `"reverse"` (required)
  - `q`: Search query string (required for `mode=search`)
  - `lat`, `lon`/`lng`: Coordinates (required for `mode=reverse`)
- **Response Payload (Search Mode)**:
  ```json
  {
    "results": [
      {
        "display_name": "Location Name, State, India",
        "lat": 23.456,
        "lon": 72.567,
        "state": "StateName",
        "district": "DistrictName"
      }
    ]
  }
  ```
- **Response Payload (Reverse Mode)**:
  ```json
  {
    "display_name": "Location Name, District, State, India",
    "lat": 23.456,
    "lon": 72.567,
    "state": "StateName",
    "district": "DistrictName"
  }
  ```

---

## 5. Weather and Moisture

### GET `/api/weather`
- **File Location**: [app/api/weather/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/weather/route.ts)
- **Purpose**: Resolves 16-day daily predictions and 24-hour hourly weather parameters from Open-Meteo API. Returns translated condition descriptors and handles lightning risk score calculations.
- **Query Parameters**:
  - `lat`: Latitude (required)
  - `lng`: Longitude (required)
- **Response Payload**: Contains detailed structures for `current`, `hourly`, `daily` forecasts, and `lightning` risk assessment.
  ```json
  {
    "latitude": 30.0,
    "longitude": 78.0,
    "current": {
      "time": "2026-07-26T03:15:00.000Z",
      "temperature_2m": 31,
      "relative_humidity_2m": 65,
      "condition": {
        "en": "Clear sky",
        "hi": "साफ़ आसमान"
      },
      "icon": "clear_day.svg"
    },
    "hourly": { ... },
    "daily": { ... },
    "lightning": {
      "score": 15,
      "category": "Low"
    }
  }
  ```

### GET `/api/forecast`
- **File Location**: [app/api/forecast/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/forecast/route.ts)
- **Purpose**: Proxies request to retrieve weather forecasts from the deep learning forecast model service.
- **Environment Dependency**: `FORECAST_MODEL_URL`
- **Query Parameters**:
  - `lat`: Latitude (required)
  - `lon`: Longitude (required)
- **Response Payload**: JSON model response object.

### GET `/api/soil-moisture`
- **File Location**: [app/api/soil-moisture/route.ts](file:///Users/shaansingh/dev/projects/farmrisk/app/api/soil-moisture/route.ts)
- **Purpose**: Proxies request to retrieve soil moisture assessments and future projections from the crop model service.
- **Environment Dependency**: `FORECAST_MODEL_URL`
- **Query Parameters**:
  - `lat`: Latitude (required)
  - `lon`: Longitude (required)
  - `crop`: Crop type (optional, e.g., `wheat`)
  - `daysbefore`: Days count for historical comparison (optional)
- **Response Payload**: Soil moisture assessment JSON object.
