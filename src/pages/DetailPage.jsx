import React from "react";
import { useNavigate } from "react-router-dom";
import useNote from "../hooks/useNote";
import NoteDetail from "../components/NoteDetail";
import NoteActionButton from "../components/NoteActionButton";
import { useParams } from "react-router-dom";
import { FiArchive, FiTrash2, FiShare } from "react-icons/fi";

function DetailPage(){

    const { id } = useParams();
    const navigate = useNavigate();
    const { notes, loading, archiveNote, unArchiveNote, getSingleNote, deleteNote } = useNote();
    React.useEffect(() => {
         getSingleNote(id);
    }, [id])

    
    const handleArchive = async (note) =>{
        event.preventDefault();
        if (note.archived){
            await unArchiveNote(note.id);
            navigate('/');
        }else{
            await archiveNote(note.id);
            navigate('/');
        }
        
    }

    const handleDelete = async (note) => {
        event.preventDefault();
        await deleteNote(note.id);
        navigate('/');
    }

   


     if (loading || !notes || notes.length === 0){
        return(
            <p>fetch...</p>
        )
    }

    const note = notes[0];

    return (
        <>
            <NoteDetail note={note} />
            <div className="detail-page__action">
                <NoteActionButton 
                variant={ note.archived ? "Pindahkan" : "Arsipkan"}
                onClick={() => {
                            handleArchive(note);
                        }}
                icon={ note.archived ? <FiShare /> : <FiArchive/>}
                />
                <NoteActionButton 
                variant={"Hapus"}
                onClick={() => {handleDelete(note);}}
                icon={<FiTrash2 />}
                />
            </div>
        </>
    );
}

export default DetailPage;