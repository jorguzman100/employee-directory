import React from 'react';
import './App.css';

// Components
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';

const THEME_STORAGE_KEY = 'employee-directory-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

function App() {
  const [theme, setTheme] = React.useState(getInitialTheme);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div className="App app-shell">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <Main theme={theme} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
