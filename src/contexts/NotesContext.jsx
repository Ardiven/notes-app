import React from "react";

import {
  getActiveNotes,
  getArchivedNotes,
  getNote as singleNoteApi,
  addNote as addNoteAPI,
  deleteNote as deleteNoteAPI,
  archiveNote as archiveNoteAPI,
  unarchiveNote as unarchiveNoteAPI,
} from "../utils/api";


const NotesContext = React.createContext();

export function NotesProvider({ children }){
    const [notes, setNotes] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

     React.useEffect(()=>{
        console.log("notes: ", notes);
    }, [notes]);

    const fetchActiveNotes = async () => {
        setLoading(true);
        const response = await getActiveNotes();

        if(response.error){
            throw new Error(response.message); 
        }

        setNotes(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
    };

    const fetchArchiveNotes = async () => {
        setLoading(true);
        const response = await getArchivedNotes();

        if(response.error){
            throw new Error(response.message); 
        }

        setNotes(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
    };

    const archiveNote = async (id) => {
        const response = await archiveNoteAPI(id);

        if(response.error){
            throw new Error (response.message);

        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
    }

    const unArchiveNote = async (id) => {
        const response = await unarchiveNoteAPI(id);

        if(response.error){
            throw new Error (response.message);

        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
    }

    const getSingleNote = async (id) =>{
        setLoading(true);
        const response = await singleNoteApi(id);

        if(response.error){
            throw new Error (response.message);
        }

        setNotes(response.data ? [response.data] : []);
        setLoading(false);
    }

    const addNote = async (note) => {
        const response = await addNoteAPI(note);

        if(response.error){
            throw new Error (response.message);

        }

    }

    const deleteNote = async (id) => {
        const response = await deleteNoteAPI(id);

        if(response.error){
            throw new Error (response.message);

        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
    }

    const value = React.useMemo(() => ({
    notes,
    loading,
    getSingleNote,
    archiveNote,
    unArchiveNote,
    fetchActiveNotes,
    fetchArchiveNotes,
    deleteNote,
    addNote,
    
  }), [notes, loading]);

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );


}

export default NotesContext;