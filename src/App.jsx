import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    // Declarative redirect — fires during render based on current state,
    // NOT imperatively after an async boundary. Replaces the navigate('/')
    // call that was racing the auth state update.
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RedirectIfAuthed({ children }) {
  const { user } = useAuth();
  console.log('[RedirectIfAuthed] render, user=', user);
  if (user) {
    // If user is logged in but on /login or /register, bounce to /
    console.log('[RedirectIfAuthed] user exists, navigate to /');
    return <Navigate to="/" replace />;
  }
  return children;
}

function AuthGate() {
  const { initializing } = useAuth();

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
            <Route path="/login" element={
              <RedirectIfAuthed><LoginPage /></RedirectIfAuthed>
            } />
            <Route path="/register" element={
              <RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>
            } />
            <Route path="/" element={
              <RequireAuth><ActivePage /></RequireAuth>
            } />
            <Route path="/archives" element={
              <RequireAuth><ArchivePage /></RequireAuth>
            } />
            <Route path="/notes/new" element={
              <RequireAuth><AddPage /></RequireAuth>
            } />
            <Route path="/notes/:id" element={
              <RequireAuth><DetailPage /></RequireAuth>
            } />
            <Route path="*" element={
              <RequireAuth><ActivePage /></RequireAuth>
            } />
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