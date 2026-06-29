import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import ActivePage from '@pages/ActivePage';
import ArchivePage from '@pages/ArchivePage';
import NoteHeader from '@components/NoteHeader';
import { LangProvider } from '@contexts/LangContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import DetailPage from '@pages/DetailPage';
import AddPage from '@pages/AddPage';
import useAuth from "@hooks/useAuth";
import { AuthProvider } from '@contexts/AuthContext';
import { NotesProvider } from '@contexts/NotesContext';
import Loading from '@components/Loading';

import './styles/style.css';

function AuthGate({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="app-container">
        <header><NoteHeader /></header>
        <main><Loading /></main>
      </div>
    );
  }

  return (
    <NotesProvider>
      <div className="app-container">
        <header><NoteHeader /></header>
        <main>
          <Routes>
            {!user ? (
              <>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/*" element={<LoginPage />} />
              </>
            ) : (
              <>
                <Route path="/" element={<ActivePage />} />
                <Route path="/archives" element={<ArchivePage />} />
                <Route path="/notes/new" element={<AddPage />} />
                <Route path="/notes/:id" element={<DetailPage />} />
                <Route path="/*" element={<ActivePage />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </NotesProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;