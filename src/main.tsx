import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import { QuizPage } from './pages/QuizPage';
import { FinalPracticePage } from './pages/FinalPracticePage';
import 'katex/dist/katex.min.css';
import './index.css';

function pathOf(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function Root() {
  const [path, setPath] = useState(pathOf);

  useEffect(() => {
    const onPop = () => setPath(pathOf());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const query = new URLSearchParams(window.location.search);
  const isFinalPractice = query.get('a') === 'final-practice' && query.get('mode') === 'written';
  const page = isFinalPractice ? <FinalPracticePage /> : path === '/quiz' ? <QuizPage /> : <App />;
  return (
    <LanguageProvider>
      <ThemeProvider>{page}</ThemeProvider>
    </LanguageProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
