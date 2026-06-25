import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BiznupHtmlPilot from './pages/BiznupHtmlPilot';
import { AppProvider } from './context/AppContext';

function App() {
  const pilot = new URLSearchParams(window.location.search).get('pilot');

  return (
    <AppProvider>
      {pilot === 'biznup' ? (
        <BiznupHtmlPilot />
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
