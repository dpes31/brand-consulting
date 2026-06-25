import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BiznupFullReportLoader from './pages/BiznupFullReportLoader';
import { AppProvider } from './context/AppContext';

function App() {
  const pilot = new URLSearchParams(window.location.search).get('pilot');

  return (
    <AppProvider>
      {pilot === 'full-biznup' ? (
        <BiznupFullReportLoader />
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
