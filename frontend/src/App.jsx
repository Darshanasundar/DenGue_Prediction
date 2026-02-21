import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="container mx-auto px-6 py-8 h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Future routes can be added here */}
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
