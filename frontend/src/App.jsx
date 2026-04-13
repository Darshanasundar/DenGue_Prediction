import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChoroplethMap from './components/ChoroplethMap';
import CorrelationCharts from './components/CorrelationCharts';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto w-full">
            <div className="mx-auto px-6 py-8 h-full max-w-7xl">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<ChoroplethMap />} />
                <Route path="/analytics" element={<CorrelationCharts />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
