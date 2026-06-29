import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UmbrexComparisonPilot from './pages/UmbrexComparisonPilot';
import BiznupFullIntegrated from './pages/BiznupFullIntegrated';
import './pages/BiznupFullIntegratedRefinement.css';
import { AppProvider } from './context/AppContext';

function App() {
  const pilot = new URLSearchParams(window.location.search).get('pilot');

  return (
    <AppProvider>
      {pilot === 'umbrex-compare' ? (
        <UmbrexComparisonPilot />
      ) : pilot === 'full-integrated' ? (
        <BiznupFullIntegrated />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      )}
    </AppProvider>
  );
}

export default App;
