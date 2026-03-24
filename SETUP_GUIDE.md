# IDS Dashboard - Full Stack Setup Guide

This project connects a Django backend API with a React/Vite frontend.

## Backend Setup (Django)

### 1. Navigate to backend directory
```bash
cd back
```

### 2. Create virtual environment (optional)
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

If you don't have a requirements.txt, install the required packages:
```bash
pip install django djangorestframework django-cors-headers
```

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. Start the backend server
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

#### Important: CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5173` (Vite default)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Edit `back/demo/settings.py` and update `CORS_ALLOWED_ORIGINS` if using different ports.

---

## Frontend Setup (React + Vite)

### 1. Navigate to frontend directory
```bash
cd front
```

### 2. Install dependencies
```bash
npm install
# or
bun install
```

### 3. Configure API URL
Create a `.env` file (or update the existing one):
```
VITE_API_URL=http://localhost:8000
```

### 4. Start development server
```bash
npm run dev
# or
bun run dev
```

The frontend will be available at `http://localhost:5173`

---

## API Endpoints

### Traffic Logs
- `GET /api/traffic/` - Get all traffic logs
- `POST /api/traffic/` - Create a traffic log
- `GET /api/traffic/suspicious/` - Get suspicious traffic
- `GET /api/traffic/statistics/` - Get traffic statistics

### Alerts
- `GET /api/alerts/` - Get all alerts
- `POST /api/alerts/` - Create an alert
- `GET /api/alerts/unresolved/` - Get unresolved alerts
- `GET /api/alerts/by_severity/` - Get alerts grouped by severity
- `POST /api/alerts/{id}/resolve/` - Mark alert as resolved

### Simulations
- `GET /api/simulations/` - Get all simulation results
- `POST /api/simulations/` - Create a simulation result
- `POST /api/simulations/launch_attack/` - Launch a simulated attack

---

## Running Both Together

### Option 1: Two Terminal Windows
**Terminal 1 (Backend):**
```bash
cd back
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd front
npm run dev
```

### Option 2: With npm concurrently (from root)
Create a root `package.json` with concurrently package or use separate terminals.

---

## Troubleshooting

### CORS Errors
- Ensure the backend is running before starting the frontend
- Check that the `CORS_ALLOWED_ORIGINS` in `settings.py` matches your frontend URL
- Restart the backend after making CORS changes

### API Not Responding
- Verify backend is running: `http://localhost:8000/api/traffic/`
- Check the backend console for errors
- Ensure the `VITE_API_URL` in `.env` is correct

### Database Issues
- Reset database: `python manage.py migrate --fake myapp zero` then `python manage.py migrate`
- Or delete `db.sqlite3` and run `python manage.py migrate`

---

## Project Structure

```
project-root/
├── back/                 # Django Backend
│   ├── manage.py
│   ├── db.sqlite3
│   ├── demo/            # Project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── myapp/           # Application
│       ├── models.py    # Traffic, Alert, SimulationResult
│       ├── views.py     # API ViewSets
│       ├── serializers.py
│       ├── urls.py
│       └── migrations/
│
└── front/               # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   ├── lib/
    │   │   ├── api-client.ts  # API client
    │   │   └── ids-engine.ts  # IDS simulation engine
    │   ├── hooks/
    │   │   └── use-ids-store.ts  # State management (synced with backend)
    │   └── main.tsx
    ├── .env              # API URL configuration
    └── vite.config.ts
```

---

## Next Steps

1. Test the API endpoints using Postman or curl
2. Create sample data to verify backend is working
3. Check browser DevTools Network tab for API calls
4. Deploy frontend and backend to production servers

Good luck! 🚀
