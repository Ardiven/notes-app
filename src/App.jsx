import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import ActivePage from '@pages/ActivePage'
import ArchivePage from '@pages/ArchivePage'
import NoteHeader  from '@components/NoteHeader'
import { LangProvider } from '@contexts/LangContext'
import { ThemeProvider } from '@contexts/ThemeContext'
import DetailPage from '@pages/DetailPage'
import AddPage from '@pages/AddPage'
import useAuth from "@hooks/useAuth"
import { NotesProvider } from '@contexts/NotesContext'

import './styles/style.css'

function App () {
  const {user, initializing} = useAuth();

  if (initializing) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}

export default App
