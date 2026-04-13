# DengueAI: Medical Intelligence Platform

DengueAI is a professional, production-grade hyper-local surveillance and operational platform for predicting and managing Dengue outbreaks. 

## Features
- **Live Location Tracking & Risk Detection:** Real-time weather data integration (via OpenWeatherMap) to assess local dengue risks.
- **Interactive Choropleth Maps:** Visualizes hyper-local and state-wide epidemiological tracking data.
- **Predictive Engine Explainability:** Provides interpretability to machine learning inferences.
- **Automated Resource Allocation Logic:** Helps in effectively dispatching medical intelligence and resources.

## Tech Stack
- **Backend:** Python (FastAPI), Pandas, Scikit-learn, Uvicorn
- **Frontend:** React, Vite, Tailwind CSS.
- **Machine Learning:** Custom models trained on historical public health and climatic data.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -U fastapi uvicorn pandas scikit-learn requests joblib
   ```
4. Start the FastAPI server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install NodeJS dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## License
MIT
