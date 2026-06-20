import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './LandingPage';
import FundamentalsPage from './FundamentalsPage';
import TestPage from './TestPage';
import ShoppingList from './ShoppingList';
import './index.css';

type View = 'landing' | 'fundamentals' | 'full-test';

const IS_PREVIEW = new URLSearchParams(window.location.search).get('preview') === 'results';
const IS_SHOPPING = new URLSearchParams(window.location.search).get('app') === 'shopping';

function App() {
  if (IS_SHOPPING) return <ShoppingList />;

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
