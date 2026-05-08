import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './LandingPage';
import FundamentalsPage from './FundamentalsPage';
import TestPage from './TestPage';
import './index.css';

type View = 'landing' | 'fundamentals' | 'full-test';

const IS_PREVIEW = new URLSearchParams(window.location.search).get('preview') === 'results';

function App() {
  const [view, setView] = useState<View>(IS_PREVIEW ? 'full-test' : 'landing');

  if (view === 'fundamentals') {
    return (
      <FundamentalsPage
        onBack={() => setView('landing')}
        onTakeFullTest={() => setView('full-test')}
      />
    );
  }

  if (view === 'full-test') {
    return <TestPage onBack={() => setView('landing')} />;
  }

  return (
    <LandingPage
      onStartFundamentals={() => setView('fundamentals')}
      onStartFullTest={() => setView('full-test')}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
