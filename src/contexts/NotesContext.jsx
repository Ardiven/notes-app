import React from "react";
import {
  getActiveNotes,
  getArchivedNotes,
  getNote as singleNoteApi,
  addNote as addNoteAPI,
  deleteNote as deleteNoteAPI,
  archiveNote as archiveNoteAPI,
  unarchiveNote as unarchiveNoteAPI,
} from "@utils/api";

const NotesContext = React.createContext();

export function NotesProvider({ children }) {
    const [notes, setNotes] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [notesError, setNotesError] = React.useState(null);

    // Stable refs — wrap in useCallback with empty deps so consumers'
    // useEffect ([fetchActiveNotes]) does NOT re-fire on every render.
    // Without this, every NotesProvider re-render produced a new function
    // reference, which the context value also pointed at, which triggered
    // ActivePage's useEffect, which called the fetch, which set loading,
    // which re-rendered NotesProvider — infinite loop.

    const fetchActiveNotes = React.useCallback(async () => {
        setLoading(true);
        setNotesError(null);
        const response = await getActiveNotes();

        if (response.error) {
            setLoading(false);
            setNotesError(response.message);
            setNotes([]);
            return;
        }

        setNotes(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
    }, []);

    const fetchArchiveNotes = React.useCallback(async () => {
        setLoading(true);
        setNotesError(null);
        const response = await getArchivedNotes();

        if (response.error) {
            setLoading(false);
            setNotesError(response.message);
            setNotes([]);
            return;
        }

        setNotes(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
    }, []);

    const getSingleNote = React.useCallback(async (id) => {
        setLoading(true);
        setNotesError(null);
        const response = await singleNoteApi(id);

        if (response.error) {
            setLoading(false);
            setNotesError(response.message);
            setNotes([]);
            return;
        }

        setNotes(response.data ? [response.data] : []);
        setLoading(false);
    }, []);

    const addNote = React.useCallback(async (note) => {
        const response = await addNoteAPI(note);

        if (response.error) {
            setNotesError(response.message);
            return;
        }

        if (response.data) {
            setNotes((prev) => [response.data, ...prev]);
        }
    }, []);

    const archiveNote = React.useCallback(async (id) => {
        const response = await archiveNoteAPI(id);

        if (response.error) {
            setNotesError(response.message);
            return;
        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
    }, []);

    const unArchiveNote = React.useCallback(async (id) => {
        const response = await unarchiveNoteAPI(id);

        if (response.error) {
            setNotesError(response.message);
            return;
        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
    }, []);

    const deleteNote = React.useCallback(async (id) => {
        const response = await deleteNoteAPI(id);

        if (response.error) {
            setNotesError(response.message);
            return;
        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
    }, []);

    const value = React.useMemo(() => ({
        notes,
        loading,
        notesError,
        getSingleNote,
        archiveNote,
        unArchiveNote,
        fetchActiveNotes,
        fetchArchiveNotes,
        deleteNote,
        addNote,
    }), [notes, loading, notesError, getSingleNote, archiveNote, unArchiveNote, fetchActiveNotes, fetchArchiveNotes, deleteNote, addNote]);

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
}

export default NotesContext;