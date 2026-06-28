import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ActivePage from './pages/ActivePage'
import ArchivePage from './pages/ArchivePage'
import NoteHeader  from './components/NoteHeader'
import { LangProvider } from './contexts/LangContext'
import ThemeContext from './contexts/ThemeContext'
import DetailPage from './pages/DetailPage'
import AddPage from './pages/AddPage'
import useAuth from "./hooks/useAuth"
import { NotesProvider } from './contexts/NotesContext'

import './styles/style.css'

function App () {
  const [theme, setTheme] = React.useState('dark');

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      return prevTheme === 'light' ? 'dark' : 'light';
    });
  };

  const themeContextValue = React.useMemo(() => {
    return {
      theme,
      toggleTheme
    };
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const {user, initializing} = useAuth();

  if (initializing) {
    return (
      <ThemeContext.Provider value={themeContextValue}>
        <LangProvider>
          <div className="app-container">
            <header>
              <NoteHeader />
            </header>
            <main>
              <p>fetch...</p>
            </main>
          </div>
        </LangProvider>
      </ThemeContext.Provider>
    )
  }

  if (!user) {
    return (
      <ThemeContext.Provider value={themeContextValue}>
        <LangProvider>
          <div className="app-container">
            <header>
              <NoteHeader />
            </header>
            <main>
              <Routes>
                <Route path="/*" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />}></Route>
              </Routes>
            </main>
          </div>
        </LangProvider>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <LangProvider>
        <div className="app-container">
          <header>
            <NoteHeader />
          </header>
          <NotesProvider>
            <main>
              <Routes>
                <Route path="/" element={<ActivePage />} />
                <Route path="/archives" element={<ArchivePage />} />
                <Route path='/notes/:id' element={<DetailPage />} />
                <Route path="/notes/new" element={<AddPage />} />
              </Routes>
            </main>
          </NotesProvider>
        </div>
      </LangProvider>
    </ThemeContext.Provider>
  )
}

export default App