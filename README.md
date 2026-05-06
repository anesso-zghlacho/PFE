# IDS Dashboard - Full Stack Application

A comprehensive Intrusion Detection System (IDS) dashboard built with Django backend and React/Vite frontend.

## 📋 Project Overview

This project consists of:
- **Backend**: Django REST API with IDS data models and packet processing
- **Frontend**: React + TypeScript + Vite dashboard
- **ML support**: model-agnostic inference pipeline with mock development mode
- **Real-time ready**: architecture designed for future WebSocket / queue streaming

## 🏗️ Project Structure

```
ids-dashboard/
├── back/                    # Django Backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── demo/                # Django project settings
│   │   ├── settings.py      # REST Framework & CORS config
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── myapp/               # Main application
│       ├── models.py        # TrafficLog, Alert
│       ├── views.py         # API endpoints
│       ├── serializers.py   # DRF serializers
│       ├── urls.py          # API routes
│       ├── processing/      # IDS ML + packet processing
│       │   ├── extractor.py
│       │   ├── model_base.py
│       │   ├── model_wrappers.py
│       │   ├── model_factory.py
│       │   ├── engine.py
│       │   ├── service.py
│       │   └── streaming.py
│       ├── migrations/
│       ├── templates/
│       └── tests/           # Backend tests
│
└── front/                   # React + Vite Frontend
    ├── src/
    │   ├── components/      # React components
    │   ├── lib/
    │   │   ├── api-client.ts    # API integration
    │   │   └── ids-types.ts     # TypeScript types
    │   ├── hooks/
    │   │   └── use-ids-store.ts # State management
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example         # API URL config example
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## 🚀 Quick Start

### Backend
```bash
cd back
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd front
npm install
npm run dev
```

Backend: `http://localhost:8000`  
Frontend: `http://localhost:5173`

## 📦 Current Backend State

- Added `back/myapp/processing/` for packet processing and inference
- Feature extractor is pure and converts raw packet payloads into ML-ready features
- Model interface supports plug-and-play future models (`sklearn`, `pytorch`, `xgboost`)
- Mock model is active for development and inference testing
- New endpoint available: `POST /api/packets/ingest/`
- Traffic and alert persistence is wired through `PacketAnalysisService`

## ✅ What is implemented

- `PacketInferenceSerializer` for packet payload validation
- `extract_packet_features()` to build ML input features
- `BaseModel` abstraction and `create_model()` factory
- `MockModel` development inference
- `TrafficLog` and `Alert` updated to store prediction results
- Packet ingestion endpoint that returns prediction output

## ⚠️ What still needs to be done

- Add real model wrappers and load real trained weights
- Wire frontend UI to ingest packets and display prediction confidence
- Add live traffic view and feature inspection dashboard
- Add production-grade streaming support (Redis/Kafka/WebSocket)
- Expand backend tests for the full packet-to-alert pipeline

## 🔧 Configuration

### CORS Settings
Edit `back/demo/settings.py` if needed:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
]
```

### API URL
Edit `front/.env` or `.env.example`:
```
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

Run backend tests:
```bash
cd back
python manage.py test myapp.tests
```

## 📖 Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions and troubleshooting.

## 🛠️ Tech Stack

**Backend:**
- Django 6.0
- Django REST Framework 3.14
- Django CORS Headers
- SQLite

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router

## 📝 Notes for next work session

- Implement real ML model loader for `sklearn`, `pytorch`, or `xgboost`
- Replace `MockModel` with a real model in `PacketAnalysisService`
- Add frontend routes/components for live traffic + alerts + confidence
- Add event streaming support for real-time dashboards
- Keep ML logic inside `back/myapp/processing/` and out of DRF views

## 👤 Author

Created for cybersecurity monitoring and IDS simulation.
# pfe
