# IDS Dashboard - Full Stack Application

A comprehensive Intrusion Detection System (IDS) dashboard built with Django backend and React/Vite frontend.

## 📋 Project Overview

This project consists of:
- **Backend**: Django REST API with IDS data models
- **Frontend**: React + TypeScript + Vite for interactive dashboard
- **Real-time sync**: Frontend syncs with backend API

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
│       ├── views.py         # API ViewSets
│       ├── serializers.py   # DRF Serializers
│       ├── urls.py          # API routes
│       ├── migrations/
│       └── templates/
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
    ├── .env                 # API URL config
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

## 📚 Features

### Dashboard
- Real-time traffic monitoring
- Alert detection and management
- Traffic statistics and visualization

### API Endpoints
- **Traffic Logs**: CRUD operations, suspicious traffic filtering
- **Alerts**: Create, retrieve, resolve alerts, severity filtering

## 🔧 Configuration

### CORS Settings
Edit `back/demo/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
]
```

### API URL
Edit `front/.env`:
```
VITE_API_URL=http://localhost:8000
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

## 📝 License

MIT

## 👤 Author

Created for cybersecurity monitoring and IDS simulation.
# pfe
